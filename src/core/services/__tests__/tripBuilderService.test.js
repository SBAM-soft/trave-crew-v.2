import { describe, it, expect } from 'vitest';
import {
  calculateDaysNeeded,
  validatePackageAddition,
  findDuplicateExperiences,
  prepareExperienceBlocks,
  compactBlocks,
  getLastDay,
  isZoneChange,
  getPreviousZoneName,
  calculateExperiencesCost,
  isBlockEditable,
  groupBlocksByZone
} from '../tripBuilderService';

describe('tripBuilderService', () => {
  describe('calculateDaysNeeded', () => {
    it('should calculate days for experiences without zone change', () => {
      const experiences = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = calculateDaysNeeded(experiences, false);

      expect(result.totalDays).toBe(4); // 3 exp + 1 logistic
      expect(result.experienceDays).toBe(3);
      expect(result.logisticsDays).toBe(1);
      expect(result.transferDays).toBe(0);
    });

    it('should add transfer day when zone changes', () => {
      const experiences = [{ id: 1 }, { id: 2 }];
      const result = calculateDaysNeeded(experiences, true);

      expect(result.totalDays).toBe(4); // 2 exp + 1 logistic + 1 transfer
      expect(result.experienceDays).toBe(2);
      expect(result.transferDays).toBe(1);
    });

    it('should handle empty experiences array', () => {
      const result = calculateDaysNeeded([], false);

      expect(result.totalDays).toBe(1); // Only logistics
      expect(result.experienceDays).toBe(0);
    });
  });

  describe('validatePackageAddition', () => {
    it('should validate when enough days available', () => {
      const experiences = [{ id: 1 }, { id: 2 }];
      const totalDays = 10;
      const filledBlocks = []; // 0 days used

      const result = validatePackageAddition(experiences, totalDays, filledBlocks, false);

      expect(result.canAdd).toBe(true);
      expect(result.daysNeeded).toBe(3); // 2 exp + 1 logistic
      expect(result.availableDays).toBe(9); // 10 - 1 (arrival)
      expect(result.missingDays).toBe(0);
    });

    it('should reject when not enough days', () => {
      const experiences = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const totalDays = 5;
      const filledBlocks = [{ day: 2 }, { day: 3 }]; // 2 days used

      const result = validatePackageAddition(experiences, totalDays, filledBlocks, false);

      expect(result.canAdd).toBe(false);
      expect(result.shouldAskAddDays).toBe(true);
      expect(result.missingDays).toBeGreaterThan(0);
    });

    it('should account for zone change in validation', () => {
      const experiences = [{ id: 1 }];
      const totalDays = 5;
      const filledBlocks = [{ day: 2 }];

      const result = validatePackageAddition(experiences, totalDays, filledBlocks, true);

      expect(result.daysNeeded).toBe(3); // 1 exp + 1 logistic + 1 transfer
    });
  });

  describe('findDuplicateExperiences', () => {
    it('should find duplicate experiences by id', () => {
      const newExperiences = [
        { id: 'EXP1' },
        { id: 'EXP2' },
        { id: 'EXP3' }
      ];

      const filledBlocks = [
        { experience: { id: 'EXP2' } },
        { experience: { id: 'EXP4' } }
      ];

      const duplicates = findDuplicateExperiences(newExperiences, filledBlocks);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].id).toBe('EXP2');
    });

    it('should find duplicate experiences by CODICE', () => {
      const newExperiences = [
        { CODICE: 'EXP1' },
        { CODICE: 'EXP2' }
      ];

      const filledBlocks = [
        { experience: { CODICE: 'EXP1' } }
      ];

      const duplicates = findDuplicateExperiences(newExperiences, filledBlocks);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].CODICE).toBe('EXP1');
    });

    it('should return empty array when no duplicates', () => {
      const newExperiences = [{ id: 'EXP1' }];
      const filledBlocks = [{ experience: { id: 'EXP2' } }];

      const duplicates = findDuplicateExperiences(newExperiences, filledBlocks);

      expect(duplicates).toHaveLength(0);
    });

    it('should handle empty blocks', () => {
      const newExperiences = [{ id: 'EXP1' }];
      const filledBlocks = [];

      const duplicates = findDuplicateExperiences(newExperiences, filledBlocks);

      expect(duplicates).toHaveLength(0);
    });
  });

  describe('prepareExperienceBlocks', () => {
    const packageData = {
      NOME_PACCHETTO: 'Test Package',
      ZONA: 'Bangkok'
    };

    it('should prepare blocks without zone change', () => {
      const experiences = [
        { nome: 'Exp 1', CODICE: 'E1' },
        { nome: 'Exp 2', CODICE: 'E2' }
      ];

      const blocks = prepareExperienceBlocks(
        experiences,
        packageData,
        'Z1',
        'Bangkok',
        2,
        false,
        null
      );

      expect(blocks).toHaveLength(3); // 1 logistics + 2 experiences
      expect(blocks[0].type).toBe('logistics');
      expect(blocks[0].day).toBe(2);
      expect(blocks[1].type).toBe('experience');
      expect(blocks[1].day).toBe(3);
      expect(blocks[2].type).toBe('experience');
      expect(blocks[2].day).toBe(4);
    });

    it('should add transfer day when zone changes', () => {
      const experiences = [{ nome: 'Exp 1' }];

      const blocks = prepareExperienceBlocks(
        experiences,
        packageData,
        'Z2',
        'Chiang Mai',
        5,
        true,
        'Bangkok'
      );

      expect(blocks).toHaveLength(3); // 1 transfer + 1 logistics + 1 experience
      expect(blocks[0].type).toBe('transfer');
      expect(blocks[0].day).toBe(5);
      expect(blocks[1].type).toBe('logistics');
      expect(blocks[1].day).toBe(6);
      expect(blocks[2].type).toBe('experience');
      expect(blocks[2].day).toBe(7);
    });

    it('should include package data in all blocks', () => {
      const experiences = [{ nome: 'Exp 1' }];

      const blocks = prepareExperienceBlocks(
        experiences,
        packageData,
        'Z1',
        'Bangkok',
        2,
        false,
        null
      );

      blocks.forEach(block => {
        expect(block.zona).toBe('Bangkok');
        expect(block.codiceZona).toBe('Z1');
      });
    });
  });

  describe('compactBlocks', () => {
    it('should compact blocks after removal', () => {
      const blocks = [
        { day: 1, name: 'Day 1' },
        { day: 2, name: 'Day 2' },
        { day: 3, name: 'Day 3' },
        { day: 4, name: 'Day 4' },
        { day: 5, name: 'Day 5' }
      ];

      const compacted = compactBlocks(blocks, 3);

      expect(compacted).toHaveLength(4);
      expect(compacted.find(b => b.name === 'Day 3')).toBeUndefined();
      const oldDay4 = compacted.find(b => b.name === 'Day 4');
      expect(oldDay4).toBeDefined();
      expect(oldDay4.day).toBe(3); // Old day 4 is now day 3
    });

    it('should not modify days before removed day', () => {
      const blocks = [
        { day: 1, name: 'Day 1' },
        { day: 2, name: 'Day 2' },
        { day: 3, name: 'Day 3' }
      ];

      const compacted = compactBlocks(blocks, 3);

      expect(compacted.find(b => b.name === 'Day 1').day).toBe(1);
      expect(compacted.find(b => b.name === 'Day 2').day).toBe(2);
    });

    it('should sort blocks by day', () => {
      const blocks = [
        { day: 5, name: 'Day 5' },
        { day: 2, name: 'Day 2' },
        { day: 7, name: 'Day 7' }
      ];

      const compacted = compactBlocks(blocks, 2);

      expect(compacted).toHaveLength(2);
      expect(compacted[0].day).toBeLessThan(compacted[1].day);
    });
  });

  describe('getLastDay', () => {
    it('should return 1 for empty blocks', () => {
      expect(getLastDay([])).toBe(1);
    });

    it('should return max day', () => {
      const blocks = [{ day: 2 }, { day: 5 }, { day: 3 }];
      expect(getLastDay(blocks)).toBe(5);
    });

    it('should handle blocks with day as number', () => {
      const blocks = [2, 5, 3];
      expect(getLastDay(blocks)).toBe(5);
    });
  });

  describe('isZoneChange', () => {
    it('should return false for empty blocks', () => {
      expect(isZoneChange([], 'ZONE1')).toBe(false);
    });

    it('should detect zone change', () => {
      const blocks = [{ codiceZona: 'ZONE1' }];
      expect(isZoneChange(blocks, 'ZONE2')).toBe(true);
    });

    it('should return false for same zone', () => {
      const blocks = [{ codiceZona: 'ZONE1' }];
      expect(isZoneChange(blocks, 'ZONE1')).toBe(false);
    });

    it('should check last block only', () => {
      const blocks = [
        { codiceZona: 'ZONE1' },
        { codiceZona: 'ZONE2' }
      ];
      expect(isZoneChange(blocks, 'ZONE2')).toBe(false);
      expect(isZoneChange(blocks, 'ZONE3')).toBe(true);
    });
  });

  describe('getPreviousZoneName', () => {
    it('should return null for empty blocks', () => {
      expect(getPreviousZoneName([])).toBeNull();
    });

    it('should return last block zone name', () => {
      const blocks = [
        { zona: 'Bangkok' },
        { zona: 'Chiang Mai' }
      ];
      expect(getPreviousZoneName(blocks)).toBe('Chiang Mai');
    });
  });

  describe('calculateExperiencesCost', () => {
    it('should sum PRX_PAX values', () => {
      const experiences = [
        { PRX_PAX: '100' },
        { PRX_PAX: '200' },
        { PRX_PAX: '50' }
      ];

      const total = calculateExperiencesCost(experiences);
      expect(total).toBe(350);
    });

    it('should handle prezzo field as fallback', () => {
      const experiences = [
        { prezzo: 100 },
        { prezzo: 200 }
      ];

      const total = calculateExperiencesCost(experiences);
      expect(total).toBe(300);
    });

    it('should handle invalid prices', () => {
      const experiences = [
        { PRX_PAX: 'invalid' },
        { PRX_PAX: '100' }
      ];

      const total = calculateExperiencesCost(experiences);
      expect(total).toBe(100);
    });

    it('should return 0 for empty array', () => {
      expect(calculateExperiencesCost([])).toBe(0);
    });
  });

  describe('isBlockEditable', () => {
    it('should return true for experience blocks', () => {
      const block = { type: 'experience' };
      expect(isBlockEditable(block)).toBe(true);
    });

    it('should return false for transfer blocks', () => {
      const block = { type: 'transfer' };
      expect(isBlockEditable(block)).toBe(false);
    });

    it('should return false for logistics blocks', () => {
      const block = { type: 'logistics' };
      expect(isBlockEditable(block)).toBe(false);
    });
  });

  describe('groupBlocksByZone', () => {
    it('should group blocks by zone', () => {
      const blocks = [
        { zona: 'Bangkok', codiceZona: 'BKK' },
        { zona: 'Bangkok', codiceZona: 'BKK' },
        { zona: 'Chiang Mai', codiceZona: 'CNX' }
      ];

      const grouped = groupBlocksByZone(blocks);

      expect(grouped).toHaveLength(2);
      expect(grouped.find(g => g.zona === 'Bangkok').blocks).toHaveLength(2);
      expect(grouped.find(g => g.zona === 'Chiang Mai').blocks).toHaveLength(1);
    });

    it('should handle empty blocks', () => {
      const grouped = groupBlocksByZone([]);
      expect(grouped).toHaveLength(0);
    });

    it('should preserve zone codes', () => {
      const blocks = [
        { zona: 'Bangkok', codiceZona: 'BKK' }
      ];

      const grouped = groupBlocksByZone(blocks);

      expect(grouped[0].codiceZona).toBe('BKK');
    });
  });
});
