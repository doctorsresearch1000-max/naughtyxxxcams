import { withCrakSubid } from "@/lib/crackrevenue/crak-subid";

/** Global Jerkmate affiliate (in-feed promo, etc.). */
const JERKMATE_TRACKING_URL_BASE =
  "https://t.ajrkmx5.com/214769/8780/32516?po=6533&aff_sub5=SF_006OG000004lmDN";

/** Tracking for mobile / wide Jerkmate banners (images served from `/public/ads/jerkmate`). */
const JERKMATE_MOBILE_GIF_TRACKING_URL_BASE =
  "https://t.ajrkmx5.com/214769/8780/32516?file_id=598296&po=6533&aff_sub5=SF_006OG000004lmDN&aff_sub4=AT_0002";

const JERKMATE_EXPLORE_GIF_TRACKING_URL_BASE =
  "https://t.ajrkmx5.com/214769/8780/32516?file_id=598462&po=6533&aff_sub5=SF_006OG000004lmDN&aff_sub4=AT_0002";

const JERKMATE_FOLLOWING_GIF_TRACKING_URL_BASE =
  "https://t.ajrkmx5.com/214769/8780/32516?file_id=600151&po=6533&aff_sub5=SF_006OG000004lmDN&aff_sub4=AT_0002";

export const JERKMATE_TRACKING_URL = withCrakSubid(JERKMATE_TRACKING_URL_BASE);
export const JERKMATE_MOBILE_GIF_TRACKING_URL = withCrakSubid(
  JERKMATE_MOBILE_GIF_TRACKING_URL_BASE,
);
export const JERKMATE_EXPLORE_GIF_TRACKING_URL = withCrakSubid(
  JERKMATE_EXPLORE_GIF_TRACKING_URL_BASE,
);
export const JERKMATE_FOLLOWING_GIF_TRACKING_URL = withCrakSubid(
  JERKMATE_FOLLOWING_GIF_TRACKING_URL_BASE,
);
