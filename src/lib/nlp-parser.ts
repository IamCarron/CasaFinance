import { BotParsedExpense, Category, UserSettings } from './types';

const CATEGORY_VOCABULARY = {
  food_supermarket: {
    categoryMatch: ['supermercado', 'alimentac', 'comida', 'grocer', 'food', 'market', 'compras', 'despensa'],
    keywords: [
      // Spanish & Regional Supermarkets
      'mercadona', 'carrefour', 'lidl', 'dia', 'aldi', 'eroski', 'alcampo', 'super', 'supermercado', 
      'hipercor', 'corte ingles', 'consum', 'bonpreu', 'esclat', 'caprabo', 'ahorramas', 'froiz', 'gadis', 
      'bm supermercados', 'coviran', 'spar', 'leclerc', 'makro', 'costco', 'sanchez romero', 'veritas',
      'supercor', 'family cash', 'dani', 'masymas', 'condis', 'charter', 'trebol', 'hiperdino', 'hiber', 
      'supeco', 'cash fresh', 'el jamon', 'la sirena', 'ametller', 'casa ametller',
      // International Supermarkets (US, UK, Europe, LatAm)
      'walmart', 'trader joe', 'whole foods', 'kroger', 'safeway', 'publix', 'target', 'tesco', 
      'sainsbury', 'asda', 'morrisons', 'waitrose', 'marks and spencer', 'm&s', 'coop', 'rewe', 
      'edeka', 'monoprix', 'auchan', 'albert heijn', 'jumbo', 'billa', 'carulla', 'chedraui', 'oxxo', 
      'soriana', 'exito', 'disco', 'pao de acucar', '7-eleven', '7 eleven', 'circle k', 'wawa', 'dollar general',
      // Bakery, Pastry & Sweets
      'panaderia', 'tahona', 'pan', 'baguette', 'baguettes', 'barra de pan', 'barra pan', 'hogaza', 
      'bollos', 'croissant', 'croissants', 'cruasan', 'napolitana', 'empanada', 'empanadillas', 'pasteles', 
      'tarta', 'bolleria', 'churros', 'porras', 'donut', 'donuts', 'galletas', 'galletitas', 'sourdough', 
      'bakery', 'pastry shop', 'bagels', 'buns',
      // Butcher, Poultry & Meat
      'carniceria', 'carnicero', 'carne', 'carne picada', 'ternera', 'pollo', 'pechugas', 'cerdo', 
      'lomo', 'costillas', 'chuleton', 'hamburguesas caseras', 'salchichas', 'chorizo', 'jamon', 
      'jamon serrano', 'jamon iberico', 'cecina', 'bacon', 'panceta', 'butcher', 'steak', 'beef', 
      'chicken', 'poultry', 'pork', 'ribs', 'sausages',
      // Fish & Seafood
      'pescaderia', 'pescadero', 'pescado', 'salmon', 'merluza', 'atun', 'bonito', 'dorada', 'lubina', 
      'bacalao', 'gambas', 'langostinos', 'calamares', 'sepia', 'pulpo', 'mejillones', 'almejas', 
      'marisco', 'seafood', 'fishmonger', 'tuna', 'cod', 'shrimp', 'prawns', 'squid', 'mussels',
      // Fruits, Veggies & Greens
      'fruta', 'fruteria', 'verdura', 'verduleria', 'hortalizas', 'platanos', 'manzanas', 'naranjas', 
      'limones', 'fresas', 'aguacate', 'aguacates', 'tomates', 'lechuga', 'patatas', 'papas', 'cebollas', 
      'ajos', 'pimientos', 'zanahorias', 'champinones', 'setas', 'espinacas', 'brocoli', 'calabacin', 
      'produce', 'greens', 'fruit', 'veggies', 'potatoes', 'onions', 'tomatoes', 'avocado',
      // Dairy, Pantry & Staples
      'lecheria', 'leche', 'leche avena', 'leche soja', 'yogures', 'queso', 'mantequilla', 'huevos', 
      'docena huevos', 'aceite de oliva', 'aove', 'aceite girasol', 'arroz', 'pasta', 'macarrones', 
      'espaguetis', 'legumbres', 'garbanzos', 'lentejas', 'alubias', 'tomate frito', 'atun lata', 
      'conservas', 'especias', 'sal', 'azucar', 'cafe en grano', 'capsulas cafe', 'capsulas nespresso', 
      'nespresso', 'infusiones', 'cereales', 'harina', 'avena', 'frutos secos', 'nueces', 'almendras', 
      'chocolate', 'snack', 'patatas fritas', 'pipas', 'aceitunas', 'refrescos', 'coca cola', 'cocacola', 
      'fanta', 'pack cervezas', 'vino mesa', 'garrafa agua', 'compra semanal', 'hacer la compra', 
      'despensa', 'groceries', 'grocery', 'supermarket', 'deli', 'dairy', 'milk', 'eggs', 'bread', 
      'cheese', 'convenience store', 'farmers market'
    ]
  },
  dining_leisure: {
    categoryMatch: ['ocio', 'restauran', 'cena', 'bar', 'dining', 'drink', 'cafe', 'entretenimiento', 'salidas'],
    keywords: [
      // Meals & Outings
      'restaurante', 'restaurant', 'cena', 'cenar', 'dinner', 'comida fuera', 'lunch', 'almuerzo', 
      'desayuno', 'breakfast', 'brunch', 'picoteo', 'tapeo', 'aperitivo', 'vermu', 'vermut', 'bar', 
      'tasca', 'taberna', 'taperia', 'meson', 'pulperia', 'marisqueria', 'chiringuito', 'terraza bar', 
      'cerveza', 'cervezas', 'canas', 'tercio', 'beer', 'beers', 'tapas', 'copas', 'cubata', 'gintonic', 
      'tragos', 'cocktail', 'cocktails', 'vino copa', 'jarra cerveza', 'sangria', 'tinto de verano', 
      'chupitos', 'cafe', 'cafeteria', 'coffee', 'pizzas', 'pizza', 'pizzeria', 'trattoria', 'burger', 
      'burgers', 'hamburguesa', 'hamburgueseria', 'sushi', 'ramen', 'wok', 'kebab', 'shawarma', 
      'churreria', 'heladeria', 'ice cream', 'creperia', 'bistro', 'steakhouse', 'pub', 'brewery', 
      'taproom', 'afterwork',
      // Fast food & Chain brands
      'mcdonalds', 'burger king', 'kfc', 'popeyes', 'subway', 'dominos', 'telepizza', 'papa johns', 
      'pizza hut', 'little caesars', 'starbucks', 'dunkin', 'tim hortons', 'costa coffee', 'five guys', 
      'shake shack', 'taco bell', 'chipotle', 'wendys', 'carls jr', 'nandos', 'vips', 'fosters hollywood', 
      'ginos', 'goiko', 'goiko grill', 'tgb', 'the good burger', '100 montaditos', 'la surena', 
      'tagliatella', 'la mafia', 'lateral', 'honest greens', 'rodilla', 'pans and company', 'taco alto', 
      'tierra burrito', 'udon', 'miss sushi', 'sibuya',
      // Delivery
      'glovo', 'uber eats', 'just eat', 'deliveroo', 'doordash', 'grubhub', 'postmates', 'wolt', 
      'rappi', 'pedidosya', 'takeaway', 'takeout', 'delivery', 'comida a domicilio',
      // Nightlife & Entertainment
      'cine', 'cinema', 'movie', 'movies', 'cinesa', 'yelmo', 'kinepolis', 'ocine', 'renoir', 
      'taquilla', 'entradas cine', 'concierto', 'concert', 'gig', 'entradas concierto', 'festival musica', 
      'entradas festival', 'fest', 'teatro', 'theater', 'obra teatro', 'musical', 'monologo', 
      'comedy club', 'museo', 'museum', 'exposicion', 'bolera', 'bolos', 'bowling', 'laser tag', 
      'escape room', 'parque atracciones', 'parque warner', 'portaventura', 'terra mitica', 'isla magica', 
      'disneyland', 'zoo', 'acuario', 'aquarium', 'karting', 'paintball', 'discoteca', 'clubbing', 
      'nightclub', 'fiesta', 'party', 'bingo', 'casino'
    ]
  },
  transport_gas: {
    categoryMatch: ['transporte', 'gasolina', 'coche', 'transport', 'fuel', 'auto', 'viaje', 'vehiculo'],
    keywords: [
      // Fuel & Gas stations
      'gasolina', 'gasoil', 'diesel', 'diesel plus', 'sp95', 'sp98', 'combustible', 'carburante', 
      'repostar', 'repostaje', 'llenar deposito', 'gasolinera', 'repsol', 'cepsa', 'bp', 'galp', 
      'shell', 'petroprix', 'plenoil', 'ballenoil', 'campsa', 'petronor', 'avia', 'valcarce', 
      'meroil', 'bonarea gas', 'esclatoil', 'esso', 'texaco', 'totalenergies gas', 'chevron', 
      'exxon', 'mobil', 'valero', 'speedway', 'sunoco', 'gas', 'gasoline', 'petrol', 'fuel', 'gas station',
      // EV Charging & Autogas
      'cargador electrico', 'cargador coche', 'supercharger', 'tesla charge', 'tesla supercharger', 
      'ionity', 'wenea', 'zunder', 'chargepoint', 'electrify america', 'ev charging', 'recarga electrico', 
      'glp', 'autogas', 'gnc', 'adblue',
      // Parking, Meters & Tolls
      'parking', 'aparcamiento', 'estacionamiento', 'parquimetro', 'zona azul', 'zona verde', 
      'parking subterraneo', 'garaje publico', 'telpark', 'easypark', 'elparking', 'apparkb', 
      'bip and drive', 'bip&drive', 'via-t', 'peaje', 'autopista', 'toll', 'tolls', 'garage parking',
      // Public Transit & Trains
      'metro', 'subway', 'underground', 'tube', 'bono metro', 'tarjeta transporte', 't-usual', 
      't-casual', 'tarjeta mobilis', 'barik', 'bat', 'mugi', 'autobus', 'bus', 'bus urbano', 
      'bus interurbano', 'alsa', 'avanza', 'socibus', 'monbus', 'flixbus', 'tren', 'train', 
      'cercanias', 'rodalies', 'renfe', 'ave', 'avlo', 'ouigo', 'iryo', 'feve', 'euskotren', 
      'fgc', 'metrovalencia', 'tranvia', 'tram', 'tmb', 'emt', 'emt madrid', 'amtrak', 'eurostar', 
      'sncf', 'deutsche bahn', 'trenitalia', 'billete tren', 'bus ticket',
      // Taxis, Rideshare & Micromobility
      'uber', 'cabify', 'bolt', 'freenow', 'lyft', 'grab', 'taxi', 'radiotaxi', 'teletaxi', 
      'blablacar', 'amovens', 'carsharing', 'zity', 'wishare', 'free2move', 'sharenow', 'bicimad', 
      'bicing', 'valenbisi', 'lime', 'dott', 'tier', 'alquiler bici', 'patinete electrico',
      // Car Maintenance, Repair & Inspection
      'itv', 'cita itv', 'taller', 'taller mecanico', 'mecanico', 'mechanic', 'revision coche', 
      'mantenimiento coche', 'cambio aceite', 'filtro aceite', 'oil change', 'cambio neumaticos', 
      'ruedas', 'neumaticos', 'tires', 'tyres', 'pinchazo', 'bateria coche', 'pastillas freno', 
      'norauto', 'feu vert', 'midas', 'aurgi', 'euromaster', 'first stop', 'bosch car service', 
      'lavado coche', 'tren lavado', 'autolavado', 'tunel lavado', 'car wash', 'limpiaparabrisas', 
      'seguro coche', 'seguro moto', 'seguro vehiculo', 'mapfre coche', 'mutua madrilena', 'linea directa',
      // Air & Sea Travel & Lodging
      'vuelo', 'flight', 'billete avion', 'plane ticket', 'tarjeta embarque', 'maleta facturada', 
      'ryanair', 'vueling', 'iberia', 'air europa', 'easyjet', 'lufthansa', 'british airways', 
      'air france', 'klm', 'wizz air', 'volotea', 'norwegian', 'ferry', 'balearia', 'trasmediterranea', 
      'alquiler coche', 'car rental', 'hertz', 'avis', 'europcar', 'sixt', 'hotel', 'hostal', 
      'pension', 'resort', 'airbnb', 'booking', 'booking.com', 'expedia', 'tasa turistica'
    ]
  },
  utilities_bills: {
    categoryMatch: ['factura', 'suministro', 'luz', 'agua', 'utilit', 'bill', 'energia', 'servicios', 'recibos'],
    keywords: [
      // Electricity & Energy
      'luz', 'electricidad', 'energia', 'factura luz', 'recibo luz', 'compania electrica', 
      'iberdrola', 'endesa', 'naturgy', 'totalenergies', 'repsol luz', 'holaluz', 'som energia', 
      'plenitude', 'octopus energy', 'lucera', 'pepeenergy', 'gana energia', 'edp', 'coned', 
      'pge', 'british gas', 'eon', 'edf', 'electricity', 'electric bill', 'power bill', 'energy bill',
      // Gas & Heating
      'gas natural', 'factura gas', 'bombona', 'bombona butano', 'butano', 'propano', 'calefaccion', 
      'calefaccion central', 'caldera', 'revision caldera', 'pellets', 'repsol butano', 'cepsa gas', 
      'heating bill', 'gas bill',
      // Water & Waste
      'agua', 'factura agua', 'recibo agua', 'canal de isabel', 'aguas de barcelona', 'agbar', 
      'aqualia', 'emasesa', 'facsa', 'aguas de valencia', 'emacsa', 'water bill', 'basura', 
      'tasa basuras', 'impuesto basuras', 'alcantarillado', 'waste management'
    ]
  },
  telecom_internet: {
    categoryMatch: ['internet', 'wifi', 'fibra', 'phone', 'mobil', 'telefonia', 'comunicaciones', 'telefono'],
    keywords: [
      'internet', 'fibra', 'fibra optica', 'wifi', 'router', 'telefono', 'telefono fijo', 
      'telefonia', 'linea movil', 'linea adicional', 'gigas extra', 'recarga movil', 'datos movil', 
      'digi', 'vodafone', 'movistar', 'o2', 'orange', 'masmovil', 'pepephone', 'yoigo', 'lowi', 
      'simyo', 'jazztel', 'finetwork', 'euskaltel', 'telecable', 'r cable', 'virgin telco', 
      'guuk', 'avatel', 'att', 'verizon', 'tmobile', 'broadband', 'fiber internet', 'phone bill', 
      'mobile carrier', 'cellular bill', 'sim card', 'esim', 'cargador movil', 'cable usb'
    ]
  },
  subscriptions: {
    categoryMatch: ['suscrip', 'subscript', 'streaming', 'digital', 'membresia', 'cuotas'],
    keywords: [
      // Video & TV Streaming
      'netflix', 'spotify', 'hbo', 'hbo max', 'max', 'disney', 'disney plus', 'disney+', 
      'amazon prime', 'prime video', 'apple tv', 'apple music', 'youtube premium', 'youtube music', 
      'twitch', 'dazn', 'filmin', 'movistar plus', 'movistar+', 'tivify', 'skyshowtime', 
      'crunchyroll', 'rakuten tv', 'atresplayer', 'mitele plus', 'audible', 'kindle unlimited', 
      'storytel', 'podimo', 'ivoox plus', 'tidal', 'deezer', 'soundcloud',
      // Software, Cloud & AI
      'icloud', 'apple one', 'google one', 'google drive', 'onedrive', 'dropbox', 'microsoft 365', 
      'office 365', 'adobe', 'adobe creative cloud', 'photoshop', 'canva', 'canva pro', 'figma', 
      'playstation plus', 'ps plus', 'xbox game pass', 'game pass', 'nintendo switch online', 
      'steam', 'epic games', 'chatgpt', 'chatgpt plus', 'openai', 'claude ai', 'anthropic', 
      'midjourney', 'github copilot', 'github', 'notion', 'notion ai', '1password', 'bitwarden', 
      'nordvpn', 'expressvpn', 'surfshark', 'protonmail', 'duolingo plus', 'super duolingo', 
      'patreon', 'substack',
      // Gym, Fitness & Sports
      'gimnasio', 'gym', 'cuota gym', 'matricula gym', 'basic fit', 'basic-fit', 'mcfit', 
      'altafit', 'vivagym', 'gofit', 'anytime fitness', 'planet fitness', 'david lloyd', 
      'metropolitan', 'virgin active', 'forus', 'dreamfit', 'brooklyn fitboxing', 'crossfit', 
      'crossfit box', 'clases yoga', 'pilates', 'pistas padel', 'alquiler pista tenis', 'padel', 
      'club deportivo', 'strava', 'strava summit', 'freeletics', 'fitness membership', 'gym membership'
    ]
  },
  home_supplies: {
    categoryMatch: ['hogar', 'casa', 'home', 'muebles', 'bricolaje', 'limpieza', 'decoracion', 'jardin'],
    keywords: [
      // Stores & Furniture
      'ikea', 'leroy merlin', 'leroy', 'bauhaus', 'brico depot', 'bricomart', 'obramat', 'aki', 
      'conforama', 'maisons du monde', 'zara home', 'jysk', 'hm home', 'casa viva', 'kenay home', 
      'kave home', 'sklum', 'tuco', 'muebles boom', 'home depot', 'lowes', 'furniture', 'muebles', 
      'sofa', 'cheslong', 'sillon', 'mesa comedor', 'mesa centro', 'sillas', 'taburetes', 'estanteria', 
      'libreria', 'armario', 'comoda', 'mesita de noche', 'somier', 'canape', 'colchon', 'almohadas', 
      'sabanas', 'funda nordica', 'edredon', 'manta', 'toallas', 'cortinas', 'estor', 'alfombra', 
      'espejo', 'lampara', 'bombilla led', 'plafon', 'decoracion', 'decor',
      // Hardware, Tools & Repairs
      'bricolaje', 'ferreteria', 'hardware store', 'herramientas', 'tools', 'taladro', 'destornillador', 
      'tornillos', 'tacos', 'martillo', 'sierra', 'cinta aislante', 'silicona', 'pintura', 'rodillo', 
      'brocha', 'cerradura', 'cerrojo', 'cerrajero', 'cambio bombin', 'duplicado llaves', 'locksmith', 
      'fontanero', 'plumber', 'desatasco', 'grifo', 'cisterna', 'electricista', 'electrician', 
      'enchufe', 'interruptor', 'persianas', 'cristalero', 'manitas', 'reparacion casa', 'home repair',
      // Cleaning, Household & Garden
      'drogueria', 'limpieza', 'cleaning', 'detergente', 'detergente lavadora', 'suavizante', 
      'fairy', 'pastillas lavavajillas', 'sal lavavajillas', 'lejia', 'amoniaco', 'kh7', 'kh-7', 
      'limpiasuelos', 'limpiacristales', 'estropajo', 'bayetas', 'fregonas', 'cubo fregona', 
      'escoba', 'recogedor', 'bolsas basura', 'trash bags', 'papel higienico', 'toilet paper', 
      'papel cocina', 'servilletas', 'papel aluminio', 'film transparente', 'ambientador', 
      'jardin', 'garden', 'jardineria', 'plantas', 'plants', 'maceta', 'jardinera', 'sustrato', 
      'tierra plantas', 'abono', 'semillas', 'manguera', 'cesped artificial', 'barbacoa', 'carbon barbacoa'
    ]
  },
  health_care: {
    categoryMatch: ['salud', 'farmacia', 'medico', 'health', 'care', 'higiene', 'personal', 'belleza', 'estetica'],
    keywords: [
      // Pharmacy & Medications
      'farmacia', 'pharmacy', 'drugstore', 'chemist', 'parafarmacia', 'botica', 'medicamentos', 
      'medicinas', 'medicine', 'pills', 'paracetamol', 'ibuprofeno', 'aspirina', 'nolotil', 
      'enantyum', 'frenadol', 'bisolvon', 'ventolin', 'amoxicilina', 'antibiotico', 'omeprazol', 
      'antihistaminico', 'colirio', 'jarabe tos', 'pomada', 'tiritas', 'gasas', 'vendas', 
      'agua oxigenada', 'alcohol 96', 'betadine', 'termometro', 'tensiometro', 'test antigenos', 
      'mascarillas', 'preservativos', 'durex', 'control', 'lubricante', 'test embarazo', 'vitaminas', 
      'magnesio', 'colageno', 'melatonina', 'suero fisiologico',
      // Optics, Hearing & Dental
      'optica', 'graduar vista', 'gafas graduadas', 'montura gafas', 'gafas sol graduadas', 
      'lentillas', 'liquido lentillas', 'lagrima artificial', 'general optica', 'alain afflelou', 
      'multiopticas', 'visionlab', 'hawkers', 'gaes', 'audifono', 'dentista', 'dentist', 
      'clinica dental', 'odontologo', 'limpieza bucal', 'empaste', 'endodoncia', 'ortodoncia', 
      'brackets', 'invisalign', 'ferula descarga', 'ferula bruxismo', 'implante dental', 
      'blanqueamiento dental', 'vitaldent', 'sanitas dental',
      // Physio, Psychology, Doctors & Insurance
      'fisioterapia', 'fisioterapeuta', 'fisio', 'masaje descontracturante', 'osteopata', 
      'podologo', 'plantillas podologicas', 'psicologo', 'psicologa', 'terapia pareja', 
      'sesion psicologia', 'psiquiatra', 'dermatologo', 'ginecologo', 'urologo', 'traumatologo', 
      'medico', 'doctor', 'consulta medica', 'analisis sangre', 'ecografia', 'resonancia magnetica', 
      'radiografia', 'seguro medico', 'sanitas', 'adeslas', 'asisa', 'dkv', 'mapfre salud', 'health insurance',
      // Personal Care, Hair & Salon
      'peluqueria', 'peluquero', 'corte de pelo', 'peinado', 'tinte pelo', 'mechas', 'balayage', 
      'haircut', 'salon', 'barberia', 'barbero', 'arreglo barba', 'afeitado', 'estetica', 
      'limpieza facial', 'manicura', 'manicure', 'pedicura', 'pedicure', 'unas gel', 'unas acrilicas', 
      'depilacion', 'cera depilatoria', 'depilacion laser', 'laser diodo', 'masaje relajante', 
      'spa', 'circuito spa', 'balneario',
      // Cosmetics, Hygiene & Perfumes
      'champu', 'shampoo', 'mascarilla pelo', 'acondicionador', 'gel ducha', 'jabon manos', 
      'desodorante', 'pasta dientes', 'cepillo dientes', 'recambios oral b', 'hilo dental', 
      'cuchillas afeitar', 'espuma afeitar', 'after shave', 'crema facial', 'serum', 'protector solar', 
      'crema solar', 'crema manos', 'cacao labios', 'maquillaje', 'rimel', 'pintalabios', 
      'perfume', 'colonia', 'perfumeria', 'primor', 'druni', 'sephora', 'douglas', 'arenal', 
      'kiko milano', 'rituals', 'the body shop', 'lush', 'yves rocher'
    ]
  },
  pets: {
    categoryMatch: ['mascota', 'pet', 'perro', 'gato', 'animal', 'veterinari', 'canino'],
    keywords: [
      'veterinario', 'veterinaria', 'vet', 'veterinary', 'clinica veterinaria', 'hospital veterinario', 
      'urgencia veterinaria', 'vacuna perro', 'vacuna gato', 'vacuna rabia', 'microchip perro', 
      'microchip gato', 'desparasitante', 'pastilla desparasitar', 'pipeta', 'collar scalibor', 
      'collar seresto', 'esterilizacion perro', 'castracion gato', 'limpieza boca perro', 
      'seguro mascota', 'barkibu', 'pienso', 'pienso perro', 'comida perro', 'comida humeda perro', 
      'latas perro', 'pienso gato', 'comida gato', 'comida humeda gato', 'latas gato', 'dog food', 
      'cat food', 'pet food', 'snacks perro', 'golosinas perro', 'huesos masticables', 'premios perro', 
      'hierba gatera', 'malta gato', 'heno conejo', 'arena gato', 'arena aglomerante', 'arena silice', 
      'arenero gato', 'cat litter', 'rascador gato', 'cama perro', 'cuna mascota', 'transportin', 
      'correa perro', 'collar perro', 'arnes perro', 'arnes julius', 'comedero', 'bebedero', 
      'fuente agua gato', 'juguetes perro', 'peluqueria canina', 'bano perro', 'tiendanimal', 
      'kiwoko', 'zooplus', 'miscota', 'maskokotas', 'pet store'
    ]
  },
  clothing_fashion: {
    categoryMatch: ['ropa', 'moda', 'calzado', 'clothes', 'clothing', 'fashion', 'apparel', 'zapatos', 'vestimenta'],
    keywords: [
      // Apparel & Garments
      'ropa', 'clothes', 'clothing', 'apparel', 'ropa deportiva', 'pantalones', 'vaqueros', 
      'jeans', 'shorts', 'bermudas', 'camisa', 'shirt', 'blusa', 'camiseta', 'tshirt', 't-shirt', 
      'polo', 'jersey', 'sueter', 'sweater', 'sudadera', 'hoodie', 'cardigan', 'chaqueta', 
      'jacket', 'cazadora', 'americana', 'blazer', 'abrigo', 'coat', 'parka', 'plumifero', 
      'anorak', 'chubasquero', 'vestido', 'dress', 'falda', 'skirt', 'mono', 'traje', 'corbata', 
      'pijama', 'ropa interior', 'underwear', 'calzoncillos', 'boxers', 'bragas', 'sujetador', 
      'bra', 'calcetines', 'socks', 'medias', 'banador', 'swimsuit', 'bikini',
      // Footwear
      'calzado', 'zapatos', 'shoes', 'mocasines', 'botas', 'boots', 'botines', 'zapatillas', 
      'zapatillas deporte', 'bambas', 'deportivas', 'sneakers', 'running shoes', 'zapatillas running', 
      'zapatillas casa', 'sandalias', 'sandals', 'chanclas', 'flip flops', 'alpargatas', 'tacones', 
      'heels', 'plantillas zapatos', 'cordones',
      // Accessories & Stores
      'bolso', 'handbag', 'bandolera', 'mochila', 'backpack', 'cartera', 'wallet', 'monedero', 
      'cinturon', 'belt', 'gorro', 'gorra', 'cap', 'sombrero', 'bufanda', 'scarf', 'guantes', 
      'gloves', 'paraguas', 'umbrella', 'joyas', 'collar', 'pulsera', 'pendientes', 'anillos', 
      'reloj pulsera', 'gafas sol', 'sunglasses', 'ray-ban', 'oakley',
      'zara', 'pull and bear', 'pull&bear', 'bershka', 'stradivarius', 'massimo dutti', 'oysho', 
      'lefties', 'mango', 'mango man', 'hm', 'h&m', 'primark', 'uniqlo', 'shein', 'asos', 
      'zalando', 'about you', 'sfera', 'cortefiel', 'springfield', 'pedro del hierro', 'womensecret', 
      'intimissimi', 'calzedonia', 'bimba y lola', 'parfois', 'tous', 'pandora', 'desigual', 
      'pepe jeans', 'levis', 'tommy hilfiger', 'calvin klein', 'ralph lauren', 'lacoste', 'scalpers', 
      'silbon', 'blue banana', 'pompeii', 'hoff', 'nike', 'adidas', 'puma', 'new balance', 
      'under armour', 'reebok', 'vans', 'converse', 'asics', 'skechers', 'decathlon', 'jd sports', 
      'foot locker', 'snipes', 'sprinter', 'forum sport'
    ]
  },
  housing_rent: {
    categoryMatch: ['alquiler', 'hipoteca', 'vivienda', 'rent', 'mortgage', 'comunidad', 'casa', 'inmueble'],
    keywords: [
      'alquiler', 'rent', 'rent payment', 'renta mensual', 'pago alquiler', 'mensualidad piso', 
      'fianza alquiler', 'deposito alquiler', 'contrato alquiler', 'seguro impago alquiler', 
      'idealista', 'fotocasa', 'habitaclia', 'hipoteca', 'mortgage', 'cuota hipoteca', 'pago hipoteca', 
      'recibo hipoteca', 'amortizacion hipoteca', 'prestamo hipotecario', 'tasacion vivienda', 
      'notaria', 'aranceles notariales', 'registro propiedad', 'gestoria hipoteca', 'comunidad vecinos', 
      'cuota comunidad', 'recibo comunidad', 'derrama', 'derrama comunidad', 'administrador fincas', 
      'ibi', 'impuesto bienes inmuebles', 'contribucion urbana', 'vado municipal', 'tasa vado', 
      'plusvalia', 'seguro hogar', 'seguro multirriesgo', 'mapfre hogar', 'santa lucia', 'ocaso', 
      'caser hogar', 'allianz hogar', 'axa hogar', 'mutua hogar', 'home insurance', 'hoa fees', 'property tax'
    ]
  },
  savings_investment: {
    categoryMatch: ['ahorro', 'bote', 'fondo', 'hucha', 'savings', 'inversion', 'invest', 'patrimonio'],
    keywords: [
      'ahorro', 'savings', 'bote ahorro', 'hucha compartida', 'fondo ahorro', 'fondo comun', 
      'hucha', 'bote vacaciones', 'hucha coche', 'bote boda', 'fondo emergencia', 'colchon seguridad', 
      'traspaso ahorro', 'transferencia ahorro', 'aportacion periodica', 'piggy bank', 'savings goal', 
      'emergency pot', 'emergency fund', 'inversion', 'investment', 'aportacion fondos', 'fondo indexado', 
      'etf', 'plan pensiones', 'plan ahorro', 'deposito plazo fijo', 'cuenta remunerada', 'letras del tesoro', 
      'bonos estado', 'indexa capital', 'myinvestor', 'trade republic', 'scalable capital', 'degiro', 
      'interactive brokers', 'xtb', 'revolut vault', 'n26 spaces', 'openbank ahorro', 'cuenta naranja'
    ]
  },
  children_education: {
    categoryMatch: ['educacion', 'colegio', 'ninos', 'hijos', 'escuela', 'education', 'kids', 'baby', 'bebe'],
    keywords: [
      'guarderia', 'escuela infantil', 'colegio', 'cuota colegio', 'mensualidad cole', 'matricula universidad', 
      'tasas universitarias', 'academia ingles', 'academia idiomas', 'clases particulares', 'profesor particular', 
      'autoescuela', 'matricula autoescuela', 'clases practicas coche', 'master', 'curso online', 'udemy', 
      'coursera', 'platzi', 'domestika', 'crehana', 'skillshare', 'masterclass', 'libros texto', 
      'material escolar', 'libreta', 'estuche', 'mochila cole', 'libros', 'libreria', 'casa del libro', 
      'panales', 'dodot', 'toallitas bebe', 'leche formula', 'papilla bebe', 'potitos', 'biberon', 
      'chupete', 'cuna bebe', 'carrito bebe', 'silla coche bebe', 'ropa bebe', 'ninera', 'canguro', 
      'babysitter', 'extraescolares', 'campamento verano'
    ]
  },
  gifts_donations: {
    categoryMatch: ['regalo', 'donacion', 'ong', 'gift', 'donation', 'eventos', 'cumpleanos'],
    keywords: [
      'regalo', 'gift', 'regalo cumpleanos', 'regalo reyes', 'regalo navidad', 'amigo invisible', 
      'regalo aniversario', 'regalo boda', 'sobre boda', 'flores', 'ramo flores', 'floristeria', 
      'bombones', 'tarjeta felicitacion', 'papel regalo', 'fiesta sorpresa', 'donacion', 'ong', 
      'cruz roja', 'medicos sin fronteras', 'unicef', 'caritas', 'greenpeace', 'save the children', 
      'cuota socio ong', 'crowdfunding', 'gofundme', 'propina', 'tip'
    ]
  }
};

export function parseExpenseMessage(
  rawText: string,
  categories: Category[],
  settings: UserSettings,
  senderNameOrPhone?: string
): BotParsedExpense | null {
  let text = rawText.trim();
  if (!text) return null;

  text = text.replace(/^(\/gasto|!gasto|\+|gasto:|\/expense|!expense|expense:)\s*/i, '').trim();

  const isTimePattern = /\b(a las|son las|hacia las|at \d|around \d)\s+\d{1,2}(?::\d{2})?\b/i.test(text);
  const isClockFormat = /^\d{1,2}:\d{2}$/.test(text);
  const isUnitCounter = /\b\d+\s*(huevos|veces|minutos|min|horas|h|dias|días|meses|anos|años|personas|amigos|kilos|kg|litros|botellas|cajas|paquetes|eggs|times|minutes|hours|days|months|years|people|bottles|boxes)\b/i.test(text);
  const isPureChatGreeting = /^(hola|buenas|que tal|ok|vale|si|no|gracias|perfecto|voy|llego|adios|hello|hi|hey|thanks|sure|cool|bye)\b/i.test(text);

  if (isTimePattern || isClockFormat || isUnitCounter || isPureChatGreeting) {
    return null;
  }

  let amount: number | null = null;
  let remainingText = text;

  const startAmountRegex = /^(\$|€|£)?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:€|\$|£|eur|euros|usd|gbp)?\s+/i;
  const startMatch = text.match(startAmountRegex);

  if (startMatch) {
    amount = parseFloat(startMatch[2].replace(',', '.'));
    remainingText = text.slice(startMatch[0].length).trim();
  } else {
    const explicitCurrencyRegex = /(\d+(?:[.,]\d{1,2})?)\s*(?:€|\$|£|eur|euros|usd|gbp)\b/i;
    const currMatch = text.match(explicitCurrencyRegex);
    if (currMatch) {
      amount = parseFloat(currMatch[1].replace(',', '.'));
      remainingText = text.replace(currMatch[0], '').trim();
    }
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return null;
  }

  let splitModeOverride: 'default' | 'equal' | null = null;
  const equalSplitRegex = /\b(50\/50|50-50|50 50|a medias|mitad|fifty fifty|half and half|split equal)\b/i;
  if (equalSplitRegex.test(remainingText)) {
    splitModeOverride = 'equal';
    remainingText = remainingText.replace(equalSplitRegex, '').trim();
  }

  let paidBy: 'common' | 'partner1' | 'partner2' = 'common';
  const p1Name = settings.partner1Name || 'Tú';
  const p2Name = settings.partner2Name || 'Pareja';

  const isExplicitCommon = /\b(comun|común|cuenta comun|cuenta común|casa|conjunto|joint|common|household|shared)\b/i.test(remainingText);
  const isP1Mention = new RegExp(`\\b(${p1Name}|yo|mio|mío|me|i paid|paid by ${p1Name})\\b`, 'i').test(remainingText);
  const isP2Mention = new RegExp(`\\b(${p2Name}|ella|el|él|suyo|suya|paid by ${p2Name})\\b`, 'i').test(remainingText);
  const isAdvanceWord = /\b(adelanto|adelante|adelanté|pague|pagué|pago yo|pagó|anticipo|out of pocket|pocket advance|advance)\b/i.test(remainingText);

  if (isExplicitCommon) {
    paidBy = 'common';
    remainingText = remainingText.replace(/\b(comun|común|cuenta comun|cuenta común|casa|conjunto|joint|common|household|shared)\b/gi, '').trim();
  } else if (isP1Mention) {
    paidBy = 'partner1';
    remainingText = remainingText.replace(new RegExp(`\\b(${p1Name}|yo|mio|mío|me|i paid|paid by ${p1Name})\\b`, 'gi'), '').trim();
  } else if (isP2Mention) {
    paidBy = 'partner2';
    remainingText = remainingText.replace(new RegExp(`\\b(${p2Name}|ella|el|él|suyo|suya|paid by ${p2Name})\\b`, 'gi'), '').trim();
  } else if (isAdvanceWord) {
    remainingText = remainingText.replace(/\b(adelanto|adelante|adelanté|pague|pagué|pago yo|pagó|anticipo|out of pocket|pocket advance|advance)\b/gi, '').trim();
    if (senderNameOrPhone) {
      const senderLower = senderNameOrPhone.toLowerCase();
      if (senderLower.includes(p2Name.toLowerCase())) {
        paidBy = 'partner2';
      } else {
        paidBy = 'partner1';
      }
    } else {
      paidBy = 'partner1';
    }
  }

  let cleanTitle = remainingText
    .replace(/^[-–—:,/]+/, '')
    .replace(/[-–—:,/]+$/, '')
    .trim();

  if (!cleanTitle || cleanTitle.length < 2) {
    cleanTitle = 'Gasto General';
  }

  cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  let matchedCategoryId = categories[0]?.id || '';
  let foundCategory = false;
  const titleLower = cleanTitle.toLowerCase();

  for (const [_, vocab] of Object.entries(CATEGORY_VOCABULARY)) {
    const hasKeywordMatch = vocab.keywords.some((kw) => titleLower.includes(kw));
    if (hasKeywordMatch) {
      const targetCat = categories.find((c) => {
        const cName = c.name.toLowerCase();
        return vocab.categoryMatch.some((pattern) => cName.includes(pattern));
      });
      if (targetCat) {
        matchedCategoryId = targetCat.id;
        foundCategory = true;
        break;
      }
    }
  }

  if (!foundCategory) {
    for (const cat of categories) {
      const cName = cat.name.toLowerCase();
      if (titleLower.includes(cName) || cName.includes(titleLower)) {
        matchedCategoryId = cat.id;
        foundCategory = true;
        break;
      }
    }
  }

  if (!foundCategory && categories.length > 0) {
    matchedCategoryId = categories[0].id;
  }

  return {
    title: cleanTitle,
    amount,
    categoryId: matchedCategoryId,
    paidBy,
    splitBetween: 'both',
    splitModeOverride,
    confidence: foundCategory ? 0.98 : 0.75,
  };
}
