import fontsJson from "../assets/json/google-font.json";

interface Fonts {
  items: IFont[];
}

export interface IFont {
  family: string;
  files: FontFiles;
}

interface FontFiles {
  regular: string;
}

export default class CustomFonts {
  private readonly fonts: IFont[];

  constructor() {
    this.fonts = (fontsJson as Fonts).items;
  }

  getAllFonts(): IFont[] {
    return this.fonts;
  }


  getFontByFamily(family: string): IFont | undefined {
    return this.fonts.find(font => font.family.toLowerCase() === family.toLowerCase());
  }

  getRandomFont(): IFont {
    const randomIndex = Math.floor(Math.random() * this.fonts.length);
    return this.fonts[randomIndex];
  }


  getAllFontFamilies(): string[] {
    return this.fonts.map(font => font.family);
  }


  searchFonts(query: string): IFont[] {
    const searchTerm = query.toLowerCase();
    return this.fonts.filter(font =>
      font.family.toLowerCase().includes(searchTerm)
    );
  }
}
