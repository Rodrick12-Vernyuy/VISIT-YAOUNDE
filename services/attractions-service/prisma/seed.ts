import slugify from 'slugify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Monuments', icon: 'landmark' },
  { name: 'Museums', icon: 'building-2' },
  { name: 'Parks & Nature', icon: 'trees' },
  { name: 'Wildlife', icon: 'paw-print' },
  { name: 'Religious Sites', icon: 'church' },
  { name: 'Cultural Centers', icon: 'palette' },
  { name: 'Shopping', icon: 'shopping-bag' },
];

const attractions = [
  {
    name: 'Reunification Monument',
    category: 'Monuments',
    district: 'Centre-ville',
    address: 'Boulevard du 20 Mai, Yaoundé',
    latitude: 3.8657,
    longitude: 11.5181,
    shortDescription: 'A striking spiral monument commemorating the 1961 reunification of French and British Cameroon.',
    description:
      'The Reunification Monument is one of Yaoundé\'s most recognizable landmarks, built to celebrate the 1961 reunification of French Cameroun and Southern Cameroons into a single nation. Its sweeping, tusk-like spiral form is covered in bas-relief carvings depicting Cameroonian history, culture, and unity, making it a popular stop for both history lovers and photographers.',
    history:
      'Commissioned after independence to symbolize national unity, the monument was designed by Cameroonian and French artists and has since become an enduring emblem of the country\'s identity.',
    openingHours: 'Daily, 8:00 AM – 6:00 PM',
    entryFee: 'Free',
    estimatedVisitDuration: '30–45 minutes',
    bestVisitingTime: 'Late afternoon, for cooler temperatures and golden-hour photos',
    safetyInfo: 'A well-trafficked central location; standard city-center precautions apply after dark.',
    accessibilityInfo: 'Paved plaza access; the interior spiral staircase has uneven steps.',
    visitorTips: 'Combine with a walk through the surrounding Centre-ville district and nearby government buildings.',
    isFeatured: true,
  },
  {
    name: 'National Museum of Yaoundé',
    category: 'Museums',
    district: 'Centre-ville',
    address: 'Place du 20 Mai, Yaoundé',
    latitude: 3.8667,
    longitude: 11.5194,
    shortDescription: 'Cameroon\'s national collection of art, artifacts, and history housed in the former presidential palace.',
    description:
      'Located in the former Presidential Palace built in 1932, the National Museum showcases an extensive collection covering Cameroon\'s ethnic diversity, from royal regalia and masks to musical instruments and archaeological finds. Exhibits are organized by region, offering a comprehensive overview of the country\'s more than 250 ethnic groups.',
    history:
      'The building originally served as the residence of French colonial administrators and later Cameroon\'s first president before being converted into a museum.',
    openingHours: 'Tue–Sun, 9:00 AM – 5:30 PM (closed Mondays)',
    entryFee: '2,000 XAF adults, 500 XAF students',
    estimatedVisitDuration: '1.5–2 hours',
    bestVisitingTime: 'Morning, when it is less crowded',
    safetyInfo: 'Secure, guarded compound.',
    accessibilityInfo: 'Ground floor is wheelchair accessible; upper galleries require stairs.',
    visitorTips: 'Guided tours in French and English are available on request at the entrance.',
    isFeatured: true,
  },
  {
    name: 'Mvog-Betsi Zoo',
    category: 'Wildlife',
    district: 'Mvog-Betsi',
    address: 'Route de Mvog-Betsi, Yaoundé',
    latitude: 3.8547,
    longitude: 11.4964,
    shortDescription: 'A rescue-focused zoo home to gorillas, chimpanzees, and other Central African wildlife.',
    description:
      'Mvog-Betsi Zoo, run in partnership with the Cameroon Wildlife Aid Fund, is primarily a rehabilitation center for animals rescued from the illegal wildlife trade. Visitors can see lowland gorillas, chimpanzees, mandrills, and a variety of birds in a forested setting close to the city center.',
    openingHours: 'Daily, 8:30 AM – 6:00 PM',
    entryFee: '2,000 XAF adults, 1,000 XAF children',
    estimatedVisitDuration: '1.5 hours',
    bestVisitingTime: 'Morning, when animals are most active',
    safetyInfo: 'Keep a safe distance from enclosures; follow keeper instructions.',
    accessibilityInfo: 'Mostly flat gravel paths; some slopes.',
    visitorTips: 'Proceeds support wildlife rescue efforts — consider a small donation.',
    isFeatured: true,
  },
  {
    name: 'Bois Sainte Anastasie',
    category: 'Parks & Nature',
    district: 'Bastos',
    address: 'Bastos, Yaoundé',
    latitude: 3.8901,
    longitude: 11.5165,
    shortDescription: 'A tranquil forested park popular for walking, picnics, and escaping the city bustle.',
    description:
      'Bois Sainte Anastasie is a green, wooded retreat in the upscale Bastos district, offering shaded walking paths, open lawns, and a peaceful escape from Yaoundé\'s busy streets. It is a favorite spot for families, joggers, and anyone looking to relax under the forest canopy.',
    openingHours: 'Daily, 6:00 AM – 7:00 PM',
    entryFee: 'Free',
    estimatedVisitDuration: '45 minutes – 1.5 hours',
    bestVisitingTime: 'Early morning or late afternoon',
    accessibilityInfo: 'Mostly flat dirt and gravel paths.',
    visitorTips: 'Bring water; shade is good but facilities are limited.',
  },
  {
    name: 'Mount Fébé',
    category: 'Parks & Nature',
    district: 'Fébé',
    address: 'Mont Fébé, Yaoundé',
    latitude: 3.9081,
    longitude: 11.5225,
    shortDescription: 'A hilltop offering panoramic views over Yaoundé\'s seven hills, golf course, and monastery.',
    description:
      'Rising above the northern edge of the city, Mount Fébé offers some of the best panoramic views of Yaoundé\'s famous "seven hills" skyline. The summit area includes a golf course, upscale hotel, and walking trails, making it a popular destination for sunset views and weekend outings.',
    openingHours: 'Daily, 24 hours (trails best visited in daylight)',
    entryFee: 'Free to access; hotel and golf facilities charge separately',
    estimatedVisitDuration: '1–2 hours',
    bestVisitingTime: 'Late afternoon for sunset views',
    safetyInfo: 'Roads can be steep and winding; drive carefully.',
    visitorTips: 'Pair a visit with the nearby Benedictine Monastery, a short drive away.',
    isFeatured: true,
  },
  {
    name: 'Lake Municipal',
    category: 'Parks & Nature',
    district: 'Elig-Essono',
    address: 'Lac Municipal, Yaoundé',
    latitude: 3.8791,
    longitude: 11.5054,
    shortDescription: 'A landscaped lakeside park with walking paths, popular for evening strolls.',
    description:
      'Lake Municipal is a man-made lake surrounded by a landscaped public park, with paved walking paths, benches, and open green space. It draws local residents in the early morning and evening for exercise, relaxation, and social gatherings.',
    openingHours: 'Daily, 6:00 AM – 8:00 PM',
    entryFee: 'Free',
    estimatedVisitDuration: '30–60 minutes',
    bestVisitingTime: 'Early morning or evening',
    visitorTips: 'A popular spot for a light jog or evening walk with lake views.',
  },
  {
    name: 'Benedictine Monastery of Mont Fébé',
    category: 'Religious Sites',
    district: 'Fébé',
    address: 'Mont Fébé, Yaoundé',
    latitude: 3.9105,
    longitude: 11.5241,
    shortDescription: 'A serene Benedictine monastery known for its handmade crafts, chants, and mountaintop setting.',
    description:
      'Perched near the summit of Mount Fébé, this Benedictine monastery is known for its peaceful atmosphere, Gregorian chant services, and a small shop selling monk-made crafts, honey, and religious items. The monastery grounds offer sweeping views over Yaoundé.',
    openingHours: 'Daily, 8:00 AM – 5:30 PM; services at set hours',
    entryFee: 'Free (donations welcome)',
    estimatedVisitDuration: '45 minutes – 1 hour',
    bestVisitingTime: 'Morning, to hear chant services',
    safetyInfo: 'Please dress modestly and keep noise levels low.',
    visitorTips: 'The gift shop sells monastery-made honey, soap, and religious art.',
  },
  {
    name: 'Palais des Congrès',
    category: 'Cultural Centers',
    district: 'Ngoa-Ekelle',
    address: 'Avenue Winston Churchill, Yaoundé',
    latitude: 3.8697,
    longitude: 11.5165,
    shortDescription: 'Yaoundé\'s main conference and cultural events venue, hosting exhibitions and performances.',
    description:
      'The Palais des Congrès is Yaoundé\'s premier venue for large conferences, cultural exhibitions, and performances. Its modern architecture and central location make it a hub for national and international events throughout the year.',
    openingHours: 'Varies by event — check current listings',
    entryFee: 'Varies by event',
    estimatedVisitDuration: 'Depends on event',
    visitorTips: 'Check the venue\'s event calendar before visiting, as access depends on scheduled programming.',
  },
  {
    name: 'Marché des Artisans (Artisan Market)',
    category: 'Shopping',
    district: 'Bastos',
    address: 'Avenue des Banques, Bastos, Yaoundé',
    latitude: 3.8873,
    longitude: 11.5203,
    shortDescription: 'A lively market of stalls selling Cameroonian wood carvings, textiles, masks, and jewelry.',
    description:
      'This artisan market is the best place in Yaoundé to find handmade Cameroonian crafts — wood carvings, bronze statues, woven baskets, textiles, and traditional masks. Vendors are generally open to friendly bargaining, and the market offers a great introduction to local craftsmanship.',
    openingHours: 'Daily, 8:00 AM – 6:30 PM',
    entryFee: 'Free entry',
    estimatedVisitDuration: '1–2 hours',
    bestVisitingTime: 'Mid-morning, when most stalls are open',
    safetyInfo: 'Keep valuables secure in crowded areas; agree on prices before purchasing.',
    visitorTips: 'Bargaining is expected and part of the experience — start below the asking price.',
  },
  {
    name: 'Centre Culturel Camerounais (Cameroonian Cultural Center)',
    category: 'Cultural Centers',
    district: 'Centre-ville',
    address: 'Rue Joseph Essono Balla, Yaoundé',
    latitude: 3.8629,
    longitude: 11.5147,
    shortDescription: 'A hub for traditional dance, music, and art exhibitions celebrating Cameroonian heritage.',
    description:
      'This cultural center hosts regular exhibitions, traditional dance and music performances, and workshops celebrating Cameroon\'s diverse heritage. It is an excellent stop for visitors wanting a deeper, curated introduction to the country\'s living traditions.',
    openingHours: 'Tue–Sat, 10:00 AM – 6:00 PM',
    entryFee: '1,000 XAF; performances priced separately',
    estimatedVisitDuration: '1 hour, longer during performances',
    visitorTips: 'Check ahead for scheduled performances — they sell out for popular cultural festivals.',
  },
];

async function main() {
  const categoryMap = new Map<string, string>();
  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: {
        name: category.name,
        slug: slugify(category.name, { lower: true, strict: true }),
        icon: category.icon,
      },
    });
    categoryMap.set(category.name, record.id);
  }

  for (const attraction of attractions) {
    const categoryId = categoryMap.get(attraction.category);
    if (!categoryId) continue;

    const slug = slugify(attraction.name, { lower: true, strict: true });
    await prisma.attraction.upsert({
      where: { slug },
      update: {},
      create: {
        name: attraction.name,
        slug,
        shortDescription: attraction.shortDescription,
        description: attraction.description,
        history: attraction.history,
        district: attraction.district,
        address: attraction.address,
        latitude: attraction.latitude,
        longitude: attraction.longitude,
        openingHours: attraction.openingHours,
        entryFee: attraction.entryFee,
        estimatedVisitDuration: attraction.estimatedVisitDuration,
        bestVisitingTime: attraction.bestVisitingTime,
        safetyInfo: attraction.safetyInfo,
        accessibilityInfo: attraction.accessibilityInfo,
        visitorTips: attraction.visitorTips,
        isFeatured: attraction.isFeatured ?? false,
        isPublished: true,
        category: { connect: { id: categoryId } },
      },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${attractions.length} attractions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
