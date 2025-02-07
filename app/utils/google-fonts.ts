import fontsJson from "../assets/json/google-font.json";

interface Fonts {
  items: Font[];
}

interface Font {
  family: string;
  files: FontFiles;
}

interface FontFiles {
  regular: string;
}

export default class CustomFonts {
  private readonly fonts: Font[];

  constructor() {
    this.fonts = (fontsJson as Fonts).items;
  }

  getAllFonts(): Font[] {
    return this.fonts;
  }


  getFontByFamily(family: string): Font | undefined {
    return this.fonts.find(font => font.family.toLowerCase() === family.toLowerCase());
  }

  getRandomFont(): Font {
    const randomIndex = Math.floor(Math.random() * this.fonts.length);
    return this.fonts[randomIndex];
  }


  getAllFontFamilies(): string[] {
    return this.fonts.map(font => font.family);
  }


  searchFonts(query: string): Font[] {
    const searchTerm = query.toLowerCase();
    return this.fonts.filter(font =>
      font.family.toLowerCase().includes(searchTerm)
    );
  }
}
