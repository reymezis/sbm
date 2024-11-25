import axios from 'axios';

interface IStyleResponse {
  name: string;
  title: string;
  titleEn: string;
  image: string;
}

export const getStyles = async (): Promise<string[]> => {
  const { data } = await axios.get<IStyleResponse[]>(
    'https://cdn.fusionbrain.ai/static/styles/key',
    { responseType: 'json' },
  );

  return data.map((res) => res.name);
};
