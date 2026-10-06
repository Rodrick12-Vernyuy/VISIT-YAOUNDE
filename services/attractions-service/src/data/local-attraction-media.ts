/**
 * Local, versioned media contract for the public attraction catalogue.
 *
 * Files live in frontend/public/images/attractions/<slug>/ so they are served
 * by the frontend CDN instead of a third-party image host.  The accompanying
 * import script records the Commons author, licence and source URL in
 * frontend/public/images/attractions/ATTRIBUTION.json.
 */
export type LocalAttractionMedia = {
  slug: string;
  query: string;
  images: Array<{ file: string; alt: string }>;
};

const location = (slug: string, query: string, name: string, extension = ['mvog-betsi-zoo', 'mount-febe', 'lake-municipal'].includes(slug) ? 'webp' : 'jpg'): LocalAttractionMedia => ({
  slug,
  query,
  images: [1, 2, 3].map((number) => ({
    file: `/images/attractions/${slug}/${slug}-${number}.${extension}`,
    alt: `${name} — view ${number}`,
  })),
});

export const LOCAL_ATTRACTION_MEDIA: LocalAttractionMedia[] = [
  location('reunification-monument', 'Monument Reunification Yaoundé', 'Reunification Monument'),
  location('national-museum-of-yaounde', 'National Museum Yaoundé Cameroon', 'National Museum of Yaoundé'),
  location('mvog-betsi-zoo', 'Mvog Betsi Zoo Yaoundé', 'Mvog-Betsi Zoo'),
  location('bois-sainte-anastasie', 'Bois Sainte Anastasie Yaoundé', 'Bois Sainte Anastasie'),
  location('mount-febe', 'Mont Fébé Yaoundé', 'Mount Fébé'),
  location('lake-municipal', 'Lac Municipal Yaoundé', 'Lake Municipal'),
  location('benedictine-monastery-of-mont-febe', 'Monastère Bénédictin Mont Fébé Yaoundé', 'Benedictine Monastery of Mont Fébé'),
  location('palais-des-congres', 'Palais des Congrès Yaoundé', 'Palais des Congrès'),
  location('marche-des-artisans-artisan-market', 'Centre international artisanat Yaoundé', 'Marché des Artisans'),
  location('centre-culturel-camerounais-cameroonian-cultural-center', 'Centre Culturel Camerounais Yaoundé', 'Centre Culturel Camerounais'),
  location('blackitude-museum', 'Blackitude Museum Yaoundé', 'Blackitude Museum'),
  location('our-lady-of-victories-cathedral', 'Cathédrale Notre-Dame des Victoires Yaoundé', 'Our Lady of Victories Cathedral'),
  location('basilica-marie-reine-des-apotres', 'Basilique Marie Reine des Apôtres Mvolyé Yaoundé', 'Basilica Marie-Reine-des-Apôtres', 'webp'),
  location('ahmadou-ahidjo-stadium', 'Stade Ahmadou Ahidjo Yaoundé', 'Ahmadou Ahidjo Stadium'),
  location('hilton-yaounde', 'Hilton Yaoundé', 'Hilton Yaoundé'),
  location('hotel-mont-febe', 'Hôtel Mont Fébé Yaoundé', 'Hôtel Mont Fébé'),
  location('les-cascades-du-mfoundi', 'Les Cascades du Mfoundi Yaoundé', 'Les Cascades du Mfoundi', 'webp'),
];

export const LOCAL_MEDIA_BY_SLUG = new Map(LOCAL_ATTRACTION_MEDIA.map((media) => [media.slug, media]));

/** Only these galleries have all three validated files in the frontend build. */
export const COMPLETE_LOCAL_MEDIA_BY_SLUG = new Map(
  ['bois-sainte-anastasie', 'mvog-betsi-zoo', 'mount-febe', 'lake-municipal', 'basilica-marie-reine-des-apotres', 'les-cascades-du-mfoundi']
    .map((slug) => [slug, LOCAL_MEDIA_BY_SLUG.get(slug)] as const)
    .filter((entry): entry is readonly [string, LocalAttractionMedia] => Boolean(entry[1])),
);
