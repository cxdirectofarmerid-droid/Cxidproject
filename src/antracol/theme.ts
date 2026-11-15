import { getStaticFiles, staticFile } from "remotion";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
/** Master Story: 27,5 detik. */
export const STORY_FRAMES = 825;

/** Area aman Story: 250 px atas dan bawah. */
export const SAFE_TOP = 250;
export const SAFE_BOTTOM = HEIGHT - 250;
export const MARGIN_X = 70;

export const C = {
  darkGreen: "#166936",
  farmriseGreen: "#3DAF2C",
  lime: "#C9F386",
  white: "#FFFFFF",
  black: "#231F20",
};

/** Gotham dipakai bila terpasang; Montserrat sebagai fallback (sesuai spesifikasi). */
export const FONT = `Gotham, "Montserrat", sans-serif`;
export const FONT_TAGLINE = `"Grota Sans Alt", "Montserrat", sans-serif`;

/** Batas scene dalam frame (30 fps), mengikuti timestamp VO. */
export const S = {
  s1: 0, // Hook 0:00
  s2: 48, // 0:01,6
  s3: 132, // 0:04,4
  s4: 234, // 0:07,8
  s5: 336, // 0:11,2
  s6: 480, // 0:16,0
  s7: 645, // 0:21,5
  s8: 748, // fade ke end card (QR diam sejak 653 = 3,2 detik)
  end: STORY_FRAMES,
};

/**
 * Nama file di folder public/. Komponen hanya memakai file yang benar-benar ada;
 * selain itu tampil placeholder berlabel, supaya render tetap jalan.
 */
export const ASSET = {
  vo: "vo_rr_mila.mp3",
  avatar: "tania_avatar.mp4",
  avatarStill: "tania_still.png",
  logo: "logo_farmrise_bayer_white.png",
  pack: "antracol_new_2026_500gr.png",
  qr: "qr_farmrise.png",
  iconFarmrise: "icon_farmrise.png",
  iconVerifikasi: "icon_verifikasi_produk_bayer.png",
  iconCoins: "icon_bayer_coins.png",
  jingle: "jingle_farmrise.mp3",
  bumper: "bumper_outro.mp4",
};

export const hasAsset = (name: string) =>
  getStaticFiles().some((f) => f.name === name);

export const asset = (name: string) => (hasAsset(name) ? staticFile(name) : null);

/**
 * Posisi wajah TANIA di klip avatar (0..1 dari lebar/tinggi video) dan zoom
 * terhadap ukuran masker. Sesuaikan setelah melihat klipnya.
 */
export const AVATAR = {
  videoAspect: 9 / 16,
  faceX: 0.5,
  faceY: 0.39,
  zoom: 1.05,
};
