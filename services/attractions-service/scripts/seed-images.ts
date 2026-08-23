import { PrismaClient } from '../node_modules/.prisma/client';

const prisma = new PrismaClient();

// Real photos of each specific location, sourced from Wikimedia Commons
// (freely licensed for reuse — CC BY-SA / CC0 / public domain). Each entry
// was visually verified against the attraction it's assigned to.
const IMAGES_BY_SLUG: Record<string, string[]> = {
  'reunification-monument': [
    'https://upload.wikimedia.org/wikipedia/commons/4/48/Monument_Reunification_4.JPG',
    'https://upload.wikimedia.org/wikipedia/commons/3/33/Statue_at_Reunification_Boulevard%2C_Yaound%C3%A9.JPG',
  ],
  'national-museum-of-yaounde': [
    'https://upload.wikimedia.org/wikipedia/commons/c/c1/Entr%C3%A9e_du_mus%C3%A9e_national_%28Yaound%C3%A9%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/0/07/Mus%C3%A9e_national_Camerounais_01.jpg',
  ],
  'mvog-betsi-zoo': [
    'https://upload.wikimedia.org/wikipedia/commons/0/00/Mvog-Betsi_Zoo-Botanical_Park.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/72/Parc_Zoo-Botanique_de_Mvog-Betsi.jpg',
  ],
  'benedictine-monastery-of-mont-febe': [
    'https://upload.wikimedia.org/wikipedia/commons/2/25/B%C3%A2timent_du_mus%C3%A9e_des_B%C3%A9n%C3%A9dictins.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/1/1e/Entr%C3%A9e_du_monast%C3%A8re.jpg',
  ],
  'mount-febe': [
    'https://upload.wikimedia.org/wikipedia/commons/1/1a/V%C3%A9g%C3%A9tation_sur_le_Mont_F%C3%A9b%C3%A9.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/2/2f/Hotel_Mont_Febe.jpg',
  ],
  'palais-des-congres': [
    'https://upload.wikimedia.org/wikipedia/commons/a/ad/Yaound%C3%A9_Palais_des_Congr%C3%A8s.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/6/6e/Palais_de_congres_de_Yaound%C3%A9.jpg',
  ],
  'lake-municipal': [
    'https://upload.wikimedia.org/wikipedia/commons/1/1a/Beaut%C3%A9_du_Lac_municipal_de_Yaounde.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e2/Centre_Nautique_Kyriakid%C3%A8s%2C_Yaound%C3%A9_01.jpg',
  ],
  'bois-sainte-anastasie': [
    'https://upload.wikimedia.org/wikipedia/commons/4/4a/Bois_Sainte_Anastasie%2C_Yaound%C3%A9.JPG',
    'https://upload.wikimedia.org/wikipedia/commons/e/e7/Bois_Sainte_Anastasie%2C_Yaound%C3%A9%2C_Cameroun.jpg',
  ],
  'centre-culturel-camerounais-cameroonian-cultural-center': [
    'https://upload.wikimedia.org/wikipedia/commons/8/86/CENTRE_CULTUREL_CAMEROUNAIS_%28Yaound%C3%A9%29_img1.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/c3/CENTRE_CULTUREL_CAMEROUNAIS_%28Yaound%C3%A9%29_img2.jpg',
  ],
  'marche-des-artisans-artisan-market': [
    "https://upload.wikimedia.org/wikipedia/commons/8/8f/Centre_international_de_l%27Artisanat_de_Yaound%C3%A9_%281%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/9/9d/Centre_international_de_l%27artisanat_de_Yaound%C3%A9_Artisanat_%282%29.jpg",
  ],
};

async function main() {
  const attractions = await prisma.attraction.findMany({ select: { id: true, slug: true } });

  await prisma.attractionImage.deleteMany({});

  for (const attraction of attractions) {
    const urls = IMAGES_BY_SLUG[attraction.slug];
    if (!urls) {
      console.warn(`No real photo mapped for slug "${attraction.slug}", skipping`);
      continue;
    }

    await prisma.attractionImage.createMany({
      data: urls.map((url, n) => ({
        attractionId: attraction.id,
        url,
        isCover: n === 0,
        position: n,
      })),
    });
  }

  console.log(`Seeded images for ${attractions.length} attractions`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
