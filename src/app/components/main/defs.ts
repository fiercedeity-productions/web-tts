export interface Format {
	code: string;
	name: string;
	extension: string;
	web: string;
}

export const Formats: Format[] = [
	{
		code: "LINEAR16",
		name: "16-bit Wave Audio (uncompressed)",
		extension: "wav",
		web: "data:audio/wav"
	}, {
		code: "MP3",
		name: "MP3 (compressed)",
		extension: "mp3",
		web: "data:audio/mpeg"
	}, {
		code: "OGG_OPUS",
		name: "Ogg Vorbis (for web)",
		extension: "ogg",
		web: "data:audio/ogg"
	}
];

export const ISOLangs = {
	"nl-NL": "Dutch",
	"es-ES": "Spanish",
	"en-GB": "English (United Kingdom)",
	"en-US": "English (United States)",
	"en-AU": "English (Australia)",
	"pt-BR": "Portuguese",
	"tr-TR": "Turkish",
	"de-DE": "German",
	"it-IT": "Italian",
	"fr-FR": "French",
	"fr-CA": "French (Canada)",
	"sv-SE": "Swedish",
	"ja-JP": "Japanese",
	"ko-KR": "Korean"
};