import axios from "axios";

export type Album = {
  userId: string;
  id: string;
  title: string;
};

export type FormattedAlbum = Omit<Album, "id">;

export const getAlbum = async (id: number): Promise<FormattedAlbum> => {
  try {
    const response = await axios.get<Album>(
      `https://jsonplaceholder.typicode.com/albums/${id}`
    );
    const album = response.data;
    if (!album) throw new Error("Album not found");

    return formatAlbum(album);
  } catch (err) {
    throw new Error("Failed to fetch album");
  }
};

export const formatAlbum = ({ userId, title }: Album): FormattedAlbum => ({
  userId,
  title,
});
