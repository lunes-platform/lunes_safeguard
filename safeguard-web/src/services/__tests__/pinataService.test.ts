import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pinataService } from '../pinataService';
import type { ProjectMetadata } from '../pinataService';

// Mock global fetch
global.fetch = vi.fn();

describe('pinataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('resolveIpfsUrl', () => {
    it('resolves ipfs:// protocol correctly', () => {
      const uri = 'ipfs://QmHash123';
      const url = pinataService.resolveIpfsUrl(uri);
      expect(url).toBe('https://gateway.pinata.cloud/ipfs/QmHash123');
    });

    it('resolves plain CID correctly', () => {
      const uri = 'QmHash123';
      const url = pinataService.resolveIpfsUrl(uri);
      expect(url).toBe('https://gateway.pinata.cloud/ipfs/QmHash123');
    });

    it('returns http urls as is', () => {
      const uri = 'https://example.com/image.png';
      const url = pinataService.resolveIpfsUrl(uri);
      expect(url).toBe(uri);
    });

    it('returns empty string for empty input', () => {
      expect(pinataService.resolveIpfsUrl('')).toBe('');
    });
  });

  describe('uploadMetadata', () => {
    it('uploads metadata and returns ipfs uri', async () => {
      const mockMetadata: ProjectMetadata = {
        name: 'Test Project',
        description: 'Description',
        category: 'DeFi'
      };

      const mockResponse = {
        IpfsHash: 'QmHash123',
        PinSize: 100,
        Timestamp: '2023-01-01'
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const uri = await pinataService.uploadMetadata(mockMetadata);

      expect(uri).toBe('ipfs://QmHash123');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('throws error on api failure', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        statusText: 'Unauthorized'
      });

      const mockMetadata: ProjectMetadata = {
        name: 'Test Project',
        description: 'Description',
        category: 'DeFi'
      };

      await expect(pinataService.uploadMetadata(mockMetadata)).rejects.toThrow('Failed to upload project metadata to IPFS');
    });
  });
});
