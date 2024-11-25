export interface InitialResponse {
  status: string;
  uuid: string;
  status_time: number;
}

export interface GeneratedResponse {
  status: string;
  uuid: string;
  images: string[];
  censored: boolean;
  generationTime: number;
}
