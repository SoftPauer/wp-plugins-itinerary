declare const wpApiSettings: WpApiSettings & typeof globalThis;

interface WpApiSettings {
  root: string;
  nonce: string;
  moodle_base_url: string;
  moodle_ws_token: string;
}
