/**
 * Services configuration for Blond House
 */

export interface Service {
	id: string
	name: string
	description: string
	duration: number // Duration in minutes
	price: string
	category?: string
}

export const services: Service[] = [
	{
		id: 'highlights',
		name: 'Highlights / Balayage / Shatush / AirTouch / Babylights',
		description:
			'Custom lightening using signature techniques, adapted to individual features such as hair structure, skin tone, and eye color. The service includes lightening, toning, and Olaplex bond protection — all fully included in the price. The result is soft, luminous transitions, clean contrast, and a natural sun-kissed finish.',
		duration: 180, // 3 hours
		price: 'from €185',
		category: 'Coloring',
	},
	{
		id: 'face-frame',
		name: 'Face Frame',
		description:
			'A precise lightening technique around the face, tailored to individual features. Creates a soft, sun-kissed effect that refreshes the look and enhances the depth of your eyes. Includes lightening, toning, and Olaplex bond protection.',
		duration: 120, // 2 hours
		price: 'from €120',
		category: 'Coloring',
	},
	{
		id: 'hair-toning',
		name: 'Hair Toning',
		description:
			'Coloring hair in a tone-on-tone or slightly darker shade. Perfect for refreshing color and enriching hair with pigment, while also providing care — the formula contains keratin for hair strength and shine.',
		duration: 80, // 1 hour 20 minutes
		price: 'from €66',
		category: 'Coloring',
	},
	{
		id: 'hair-cut',
		name: 'Hair Cut',
		description:
			'A personalized haircut design, taking into account head shape, hair movement, and structure, crafted to complement the facial oval.',
		duration: 60, // 1 hour
		price: '€61',
		category: 'Cutting',
	},
	{
		id: 'lebel-express',
		name: 'Vegan Lebel – Express Recovery',
		description:
			'4-step micro-molecular treatment for nourished, strong, and radiant hair. Can be done before coloring or on its own. Effects last 1–2 weeks.',
		duration: 80, // 1 hour 20 minutes
		price: 'from €90',
		category: 'Treatment',
	},
	{
		id: 'lebel-full',
		name: 'Vegan Lebel – Full Ritual',
		description:
			'4-step micro-molecular treatment for nourished, strong, and radiant hair. Full ritual version with extended care. Effects last 1–2 weeks.',
		duration: 120, // 2 hours (Full ritual is typically longer)
		price: 'from €130',
		category: 'Treatment',
	},
	{
		id: 'scalp-peeling',
		name: 'Scalp Peeling by Lebel',
		description:
			'Micro-molecular scalp treatment with massage to cleanse, restore, and stimulate hair follicles. Leaves the scalp refreshed and balanced.',
		duration: 30, // 30 minutes
		price: 'from €35',
		category: 'Treatment',
	},
	{
		id: 'beach-waves',
		name: 'Beach Waves / Styling',
		description:
			'Effortless, pillow-inspired waves for a soft, airy look. Perfect for evening styles with minimal styling, creating natural, flowing movement.',
		duration: 30, // 30 minutes
		price: 'from €40',
		category: 'Styling',
	},
]

export function getServiceById(id: string): Service | undefined {
	return services.find(service => service.id === id)
}

export function formatDuration(minutes: number): string {
	const hours = Math.floor(minutes / 60)
	const mins = minutes % 60
	if (hours === 0) {
		return `${mins} min`
	}
	if (mins === 0) {
		return hours === 1 ? '1 hour' : `${hours} hours`
	}
	return hours === 1 ? `1h ${mins}min` : `${hours}h ${mins}min`
}

