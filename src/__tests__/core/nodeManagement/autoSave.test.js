import { autoSave, __testResetAutoSave } from '../../../core/nodeManagement';
import { nodeDIConfig } from '../../../core/nodeManagement/config/nodeDIConfig';
import { saveToIndexedDB } from '../../../core/nodeManagement/Storage/MemoryStorage';

// 模拟IndexedDB存储
jest.mock('../../../core/nodeManagement/Storage/MemoryStorage', () => ({
  saveToIndexedDB: jest.fn().mockResolvedValue(true)
}));

describe('自动保存机制测试', () => {
  beforeAll(async () => {
    await nodeDIConfig.init();
  });

  beforeEach(() => {
    __testResetAutoSave();
    jest.useFakeTimers();
    saveToIndexedDB.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('防抖触发自动保存', () => {
    // 模拟快速连续修改
    autoSave('node1', { content: '修改1' });
    autoSave('node1', { content: '修改2' });
    autoSave('node1', { content: '修改3' });

    // 时间未到不应触发
    jest.advanceTimersByTime(200);
    expect(saveToIndexedDB).not.toHaveBeenCalled();

    // 300ms后应触发一次
    jest.advanceTimersByTime(100);
    expect(saveToIndexedDB).toHaveBeenCalledTimes(1);
  });

  test('5分钟定时保存', () => {
    autoSave('node1', { content: '定时测试' });
    jest.advanceTimersByTime(5 * 60 * 1000 - 1);
    expect(saveToIndexedDB).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(saveToIndexedDB).toHaveBeenCalledTimes(1);
  });

  test('IndexedDB存储结构验证', async () => {
    const testData = {
      nodes: {
        '1': { id: '1', content: '测试节点' }
      },
      edges: []
    };
    
    await autoSave('1', testData);
    expect(saveToIndexedDB).toHaveBeenCalledWith(
      expect.objectContaining({
        nodes: expect.any(Object),
        edges: expect.any(Array),
        lastSaved: expect.any(Number)
      })
    );
  });
});
