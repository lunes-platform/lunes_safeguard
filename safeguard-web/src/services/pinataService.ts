export interface PinataConfig {
  jwt: string;
  gateway: string;
}

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

export interface ProjectMetadata {
  name: string;
  description: string;
  category: string;
  logoUri?: string;
  website?: string;
  socials?: {
    twitter?: string;
    telegram?: string;
    github?: string;
    discord?: string;
  };
  documents?: {
    audit?: string;
    whitepaper?: string;
  };
  team?: {
    size?: number;
    linkedin?: string;
  };
}

class PinataService {
  private config: PinataConfig;
  private baseUrl = 'https://api.pinata.cloud';

  constructor() {
    this.config = {
      jwt: import.meta.env.VITE_PINATA_JWT || '',
      gateway: import.meta.env.VITE_PINATA_GATEWAY || 'gateway.pinata.cloud'
    };
  }

  private getHeaders() {
    if (!this.config.jwt) {
      console.warn('Pinata JWT not configured in .env');
    }
    return {
      'Authorization': `Bearer ${this.config.jwt}`
    };
  }

  /**
   * Upload JSON metadata to IPFS via Pinata
   */
  async uploadMetadata(metadata: ProjectMetadata): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `safegard-project-${metadata.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.statusText}`);
      }

      const data = await response.json() as PinataResponse;
      return `ipfs://${data.IpfsHash}`;
    } catch (error) {
      console.error('Error uploading metadata to Pinata:', error);
      throw new Error('Failed to upload project metadata to IPFS');
    }
  }

  /**
   * Upload a file (image/doc) to IPFS via Pinata
   */
  async uploadFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const metadata = JSON.stringify({
        name: `safegard-file-${file.name}-${Date.now()}`
      });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({
        cidVersion: 1
      });
      formData.append('pinataOptions', options);

      const response = await fetch(`${this.baseUrl}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.jwt}`
          // Content-Type header is automatically set by fetch for FormData
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.statusText}`);
      }

      const data = await response.json() as PinataResponse;
      return `ipfs://${data.IpfsHash}`;
    } catch (error) {
      console.error('Error uploading file to Pinata:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  /**
   * Fetch metadata from IPFS
   * Handles both ipfs:// protocol and direct HTTP(s) URLs
   */
  async getMetadata(uri: string): Promise<ProjectMetadata | null> {
    try {
      // Resolve URI to HTTP URL
      const url = this.resolveIpfsUrl(uri);
      
      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }
      
      return await response.json() as ProjectMetadata;
    } catch (error) {
      console.error(`Error fetching metadata from ${uri}:`, error);
      return null;
    }
  }

  /**
   * Convert ipfs:// URI to HTTP gateway URL
   */
  resolveIpfsUrl(uri: string): string {
    if (!uri) return '';
    
    // Already http(s)
    if (uri.startsWith('http')) return uri;
    
    // ipfs://Qm... or ipfs://bafy...
    if (uri.startsWith('ipfs://')) {
      const cid = uri.replace('ipfs://', '');
      return `https://${this.config.gateway}/ipfs/${cid}`;
    }
    
    // Just CID
    return `https://${this.config.gateway}/ipfs/${uri}`;
  }
}

export const pinataService = new PinataService();
export default pinataService;
