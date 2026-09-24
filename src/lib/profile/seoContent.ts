export type ModelSEOInput = {
  name: string;
  handle: string;
  traits: string[];
  language: string;
  bodyType: string;
};

export function generateUniqueSEOContent(model: ModelSEOInput) {
  const traitsList = model.traits.join(", ");

  return {
    title: `${model.name} (${model.handle}) — Live Cam Profile & Verified Shows`,
    intro: `Hey lovers! This is ${model.handle}'s hub — ${model.name} here. I'm your favorite cam model mixing 🇬🇧 ${model.language} and ✨ ${model.bodyType}, with real chat interaction on every live stream. Streaming when I can, vibing in chat, and going extra spicy on private shows. Save this profile, turn on alerts, and come say hi when I'm live — worth every token.`,
    longDescription: `${model.name} is a verified performer profile connected to authorized live cam networks. This official permalink consolidates ${model.name}'s live on cam, discovery tags, gallery media, and Telegram alert options in one crawlable destination. From a content perspective, ${model.name} is associated with traits such as ${traitsList} and communicates in ${model.language}. NaughtyXXXCams surfaces structured attributes so visitors can compare performers before opening a live room. When offline, this page still provides verified metadata, photo previews, and notify-when-live actions.`,
  };
}
