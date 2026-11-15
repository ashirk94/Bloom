// The interests and values a user can pick from.
// This is the single source of truth: the React app downloads it from
// GET /api/options, and the server uses it to validate what users submit.

const MAX_RANKED = 5;

const INTERESTS = [
	{ name: "Photography", emoji: "📸" },
	{ name: "Hiking", emoji: "🥾" },
	{ name: "Travel", emoji: "✈️" },
	{ name: "Art", emoji: "🎨" },
	{ name: "Reading", emoji: "📚" },
	{ name: "Technology", emoji: "💻" },
	{ name: "Gaming", emoji: "🎮" },
	{ name: "Coffee", emoji: "☕" },
	{ name: "Music", emoji: "🎵" },
	{ name: "Movies", emoji: "🎬" },
	{ name: "Yoga", emoji: "🧘" },
	{ name: "Gardening", emoji: "🌱" },
	{ name: "Cooking", emoji: "👨‍🍳" },
	{ name: "Meditation", emoji: "🕯️" },
	{ name: "Nature", emoji: "🌲" },
	{ name: "Writing", emoji: "✍️" },
	{ name: "Fitness", emoji: "💪" },
	{ name: "Sports", emoji: "⚽" }
];

const VALUES = [
	{ name: "Family", emoji: "👪" },
	{ name: "Ambition", emoji: "🚀" },
	{ name: "Compassion", emoji: "❤️" },
	{ name: "Honesty", emoji: "✋" },
	{ name: "Spirituality", emoji: "🙏" },
	{ name: "Adventure", emoji: "🗺️" },
	{ name: "Creativity", emoji: "🎨" },
	{ name: "Growth", emoji: "📈" },
	{ name: "Independence", emoji: "🦅" },
	{ name: "Innovation", emoji: "💡" },
	{ name: "Learning", emoji: "📖" },
	{ name: "Friendship", emoji: "🤝" },
	{ name: "Humor", emoji: "😄" },
	{ name: "Reliability", emoji: "⚡" },
	{ name: "Peace", emoji: "☮️" },
	{ name: "Health", emoji: "💪" },
	{ name: "Mindfulness", emoji: "🧠" },
	{ name: "Balance", emoji: "⚖️" }
];

module.exports = {
	MAX_RANKED,
	INTERESTS,
	VALUES,
	INTEREST_NAMES: INTERESTS.map((option) => option.name),
	VALUE_NAMES: VALUES.map((option) => option.name)
};
