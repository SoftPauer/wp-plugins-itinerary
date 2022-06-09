declare const wpApiSettings: WpApiSettings & typeof globalThis;

interface WpApiSettings {
  root: string;
  nonce: string;
}
