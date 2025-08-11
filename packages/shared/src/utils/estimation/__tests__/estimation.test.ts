import { MOVE_SIZE_CUFT } from '../../estimation/constants';

describe('estimation constants', () => {
  it('includes studio mapping', () => {
    expect(MOVE_SIZE_CUFT['Studio Apartment']).toBe(288);
  });
});
