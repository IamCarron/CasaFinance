import { BotParsedExpense, Category, UserSettings } from './types';

export interface CategoryMatchResult {
  categoryId: string;
  categoryName: string;
  confidence: number;
}

export const CATEGORY_VOCABULARY: Record<string, { categoryIds: string[]; categoryMatch: string[]; keywords: string[] }> = {
  health_pharmacy: {
    categoryIds: ['cat-salud'],
    categoryMatch: ['farmacia', 'salud', 'medic', 'health', 'pharmac', 'bienestar', 'wellness', 'sanidad', 'clinica'],
    keywords: [
      'farmacia', 'pharmacy', 'chemist', 'drugstore', 'parafarmacia',
      'botica', 'boticario', 'receta medica', 'medicamentos', 'medicinas',
      'medicina', 'medicine', 'medicacion', 'pastillas', 'pills',
      'tablets', 'capsulas', 'jarabe', 'inyeccion', 'ampolla',
      'gotas', 'pomada', 'crema medicinal', 'unguento', 'paracetamol',
      'ibuprofeno', 'ibuprofene', 'aspirina', 'aspirine', 'nolotil',
      'metamizol', 'enantyum', 'dexketoprofeno', 'naproxeno', 'voltaren',
      'diclofenaco', 'radio salil', 'fastum', 'reflex', 'trombocid',
      'termalgin', 'gelocatil', 'efferalgan', 'tylenol', 'advil',
      'motrin', 'aleve', 'painkillers', 'calmante', 'analgesico',
      'antiinflamatorio', 'antipiretico', 'frenadol', 'frenadol complex', 'frenadol descongestivo',
      'couldina', 'pharmagrip', 'propalgina', 'bisolvon', 'fluimucil',
      'mucosan', 'acetilcisteina', 'flumil', 'jarabe tos', 'expectorante',
      'cough syrup', 'strepsils', 'lizipaina', 'angileptol', 'bucometasana',
      'pastillas juanola', 'ricola', 'propoleo', 'miel propoleo', 'pulverizador garganta',
      'gargarismos', 'vicks vaporub', 'vaporub', 'inhalaciones', 'mentol',
      'eucalipto', 'omeprazol', 'pantoprazol', 'lansoprazol', 'almax',
      'gaviscon', 'rennie', 'antiacido', 'aerored', 'simeticona',
      'pankreoflat', 'fortasec', 'imodium', 'loperamida', 'sueroral',
      'suero oral', 'electrolitos', 'probioticos', 'ultralevura', 'casenbiotico',
      'lactoflora', 'duphalac', 'movicol', 'plantago ovata', 'sen',
      'micralax', 'supositorios', 'enema', 'sales de fruta', 'sal de frutas eno',
      'bicarbonato', 'digestivo', 'nauseas', 'biodramina', 'primperan',
      'cidine', 'ventolin', 'salbutamol', 'inhalador', 'aerocamar',
      'pulmicort', 'budesonida', 'symbicort', 'antihistaminico', 'ebastina',
      'ebastel', 'loratadina', 'cetirizina', 'polaramine', 'bilaxten',
      'rupatadina', 'desloratadina', 'alergia', 'spray nasal', 'respibien',
      'rhinospray', 'utabon', 'sinomarin', 'fisiomer', 'suero fisiologico',
      'agua de mar nasal', 'nebulizador', 'amoxicilina', 'augmentine', 'clamoxyl',
      'azitromicina', 'ciprofloxacino', 'monurol', 'fosfomicina', 'antibiotico',
      'antibiotic', 'canesten', 'clotrimazol', 'daktarin', 'gyno canesten',
      'fucidine', 'bactroban', 'silvederma', 'zovirax', 'aciclovir',
      'antifungico', 'antiviral', 'melatonina', 'dormidina', 'doxylamina',
      'valeriana', 'pasiflora', 'sedavit', 'aquilea sueno', 'triptofano',
      '5-htp', 'ansiolitico', 'diazepam', 'lorazepam', 'orfidal',
      'lexatin', 'trankimazin', 'relajante muscular', 'vitaminas', 'multivitaminas',
      'vitamina c', 'vitamina d', 'vitamina b12', 'acido folico', 'hierro',
      'ferosor', 'tardyferon', 'magnesio', 'colageno', 'acido hialuronico',
      'glucosamina', 'omega 3', 'zinc', 'coenzima q10', 'arkopharma',
      'aquilea', 'pharmaton', 'berocca', 'supradyn', 'redoxon',
      'nutergia', 'solgar', 'jalea real', 'espirulina', 'levadura de cerveza',
      'tiritas', 'band-aids', 'bandages', 'apositos', 'compeed',
      'ampollas pies', 'gasas', 'gasas esteriles', 'vendas', 'venda elastica',
      'esparadrapo', 'algodon', 'alcohol 96', 'agua oxigenada', 'betadine',
      'povidona yodada', 'clorhexidina', 'cristalmina', 'arnica', 'arnidol',
      'termometro', 'termometro digital', 'tensiometro', 'pulsioximetro', 'saturimetro',
      'test antigenos', 'test covid', 'test gripe', 'mascarilla ffp2', 'mascarillas quirurgicas',
      'guantes nitrilo', 'guantes latex', 'bolsa agua caliente', 'bolsa frio calor', 'manta termica',
      'first aid', 'botiquin', 'pastillero', 'jeringuilla', 'preservativos',
      'condones', 'condoms', 'durex', 'control', 'skyn',
      'lubricante', 'lubricante intimo', 'test embarazo', 'clearblue', 'test ovulacion',
      'copa menstrual', 'tampones', 'compresas', 'salvaslips', 'evax',
      'tampax', 'ausonia', 'bragas menstruales', 'melagyn', 'saforelle',
      'cumlaude', 'gel intimo', 'hidratante vaginal', 'colirio', 'lagrimas artificiales',
      'systane', 'hyabak', 'optrex', 'colircusi', 'tobrex',
      'visine', 'suero oftalmico', 'lentillas', 'lentes de contacto', 'liquido lentillas',
      'liquido de lentillas', 'solucion unica lentillas', 'estuche lentillas', 'gafas graduadas', 'graduar vista',
      'general optica', 'alain afflelou', 'multiopticas', 'visionlab', 'optica',
      'optometrista', 'toallitas limpiagafas', 'dentista', 'dentist', 'odontologo',
      'clinica dental', 'vitaldent', 'sanitas dental', 'limpieza bucal', 'tartrectomia',
      'empaste', 'endodoncia', 'ortodoncia', 'brackets', 'invisalign',
      'ferula de descarga', 'ferula bruxismo', 'implante dental', 'corona dental', 'puente dental',
      'extraccion muela', 'muela del juicio', 'blanqueamiento dental', 'pasta de dientes', 'dentifrico',
      'sensodyne', 'lacer', 'parodontax', 'colgate', 'oral-b',
      'oral b', 'cepillo electrico', 'cabezales oral-b', 'seda dental', 'hilo dental',
      'interdentales', 'enjuague bucal', 'colutorio bucal', 'listerine', 'clorhexidina bucal',
      'corega', 'fixodent', 'crema fijadora dentadura', 'aftas', 'aloclair',
      'aftamed', 'oralsone', 'ortopedia', 'plantillas ortopedicas', 'munequera',
      'rodillera', 'tobillera', 'cabestrillo', 'faja lumbar', 'collarin',
      'baston', 'muletas', 'medias de compresion', 'medico', 'doctor',
      'consulta medica', 'cita medica', 'urgencias medicas', 'urgencias', 'hospital',
      'analisis de sangre', 'analisis orina', 'analisis clinicos', 'ecografia', 'resonancia magnetica',
      'radiografia', 'rayos x', 'electrocardiograma', 'fisioterapia', 'fisioterapeuta',
      'fisio', 'osteopata', 'rehabilitacion', 'podologo', 'quiropodista',
      'dermatologo', 'ginecologo', 'urologo', 'traumatologo', 'cardiologo',
      'oftalmologo', 'oculista', 'otorrino', 'endocrino', 'neurologo',
      'alergologo', 'psicologo', 'psicologa', 'psiquiatra', 'sesion terapia',
      'terapia de pareja', 'seguro medico', 'sanitas', 'adeslas', 'asisa',
      'dkv', 'mapfre salud', 'caser salud', 'painkiller', 'acetaminophen',
      'ibuprofen', 'aspirin', 'cough drops', 'throat lozenges', 'lozenges',
      'antihistamine', 'allergy pills', 'claritin', 'zyrtec', 'benadryl',
      'allegra', 'flonase', 'nasal spray', 'decongestant', 'eye drops',
      'artificial tears', 'rubbing alcohol', 'hydrogen peroxide', 'gauze pads', 'medical tape',
      'first aid kit', 'thermometer', 'digital thermometer', 'blood pressure monitor', 'pulse oximeter',
      'covid test', 'antigen test', 'pregnancy test', 'ovulation test', 'tampons',
      'menstrual pads', 'sanitary pads', 'panty liners', 'menstrual cup', 'contact lenses',
      'contact solution', 'saline solution', 'lens case', 'reading glasses', 'prescription glasses',
      'dental cleaning', 'tooth filling', 'root canal', 'braces', 'night guard',
      'teeth whitening', 'toothpaste', 'toothbrush', 'electric toothbrush', 'dental floss',
      'mouthwash', 'antiseptic mouthwash', 'denture adhesive', 'canker sore gel', 'doctor appointment',
      'physician', 'urgent care', 'clinic', 'blood test', 'urine test',
      'x-ray', 'mri scan', 'ultrasound', 'prescription medication', 'refill prescription',
      'physical therapy', 'physiotherapy', 'chiropractor', 'dermatologist', 'gynecologist',
      'pediatrician', 'orthopedic', 'psychologist', 'psychiatrist', 'counseling',
      'therapy session', 'health insurance', 'sleeping pills', 'melatonin gummies', 'vitamin c',
      'vitamin d3', 'multivitamins', 'fish oil', 'zinc supplements', 'iron pills',
      'magnesium', 'collagen peptides', 'digestive enzymes', 'probiotic capsules', 'antacid',
      'tums', 'pepto-bismol', 'laxative', 'stool softener', 'hydrocortisone cream',
      'antibiotic ointment', 'neosporin', 'burn cream', 'ice pack', 'heating pad',
      'compression socks', 'ankle brace', 'knee brace', 'wrist splint', 'crutches',
      'dalsy', 'apiretal', 'paidoterin', 'expecto dhu', 'romilar',
      'iniston', 'flumil forte', 'cinfa', 'normon', 'stada',
      'kern pharma', 'teva', 'ratiopharm', 'arnidol spray', 'cristalmina spray',
      'betadine gel', 'voltadol', 'voltadol forte', 'voltaren emulgel', 'radio salil spray',
      'ibuprofeno cinfa', 'paracetamol cinfa', 'omeprazol cinfa', 'loratadina cinfa', 'amoxicilina cinfa',
      'amoxicilina clavulanico', 'augmentine 875', 'polaramine crema', 'fenergan', 'arkopharma jalea real',
      'sueroral hiposodico', 'casen fleet', 'micralax canulas', 'plantaben', 'fave de fuca',
      'evacuol', 'dulcolaxo', 'almax masticable', 'gaviscon forte', 'almax sobres',
      'redoxon complex', 'berocca boost', 'supradyn activo', 'pharmaton complex', 'multicentrum',
      'multicentrum mujer', 'multicentrum hombre', 'colnatur', 'epaplus', 'arkoflex',
      'ferro sanol', 'ferosor folico', 'tardyferon 80', 'hidropolivit', 'protovit',
      'calcigen', 'folidoc', 'yoduk', 'gestagyn', 'natalben',
      'femibion', 'melagyn gel', 'isdin ginecanesten', 'saforelle solucion', 'vagisil',
      'clotrimazol ginecanesten', 'vaginesil lubricante', 'control retard', 'durex sabor fresa', 'durex invisible',
      'control nature', 'skyn elite', 'test clearblue digital', 'tiras reactivas glucosa', 'glucometro',
      'lancetas', 'apositos hansaplast', 'tiritas plasticas', 'tiritas tela', 'esparadrapo papel',
      'venda crepe', 'parches termicos', 'thermacare', 'parches calor', 'bolsa de hielo',
      'tiritas infantiles', 'colirio tobrex', 'oftalmowell', 'lagrimas artelac', 'lagrimas optava',
      'renu multiplus', 'opti-free express', 'solocare aqua', 'biotrue', 'bexident encias',
      'parodontax original', 'sensodyne repair', 'colgate total', 'elmex infantil', 'oral b pro 3',
      'cepillo interprox', 'seda dental lacer', 'fluor lacer', 'corega fijador extra', 'kukident pro',
      'pastillas corega ortodoncia', 'cera ortodoncia', 'interprox plus', 'gel aftas lacer', 'aftamed spray',
      'aloclair plus gel', 'dalsy suspension oral', 'apiretal gotas', 'junifen infantil', 'febrectal lactantes',
      'febrectal supositorios', 'paidoterin descongestivo', 'paidofebril jarabe', 'aerored gotas lactantes', 'colimil baby',
      'reuteri gotas probiotico', 'bivos probiotico pediatrico', 'suero fisiologico monodosis', 'aspirador nasal narhinel', 'recambios narhinel',
      'crema de panal eryplast', 'weleda crema panal calendula', 'nutraisdin zn40', 'mustela hydra bebe', 'sebamed baby gel de bano',
      'suavinex colonia infantil', 'ibuprofeno kern pharma 600', 'paracetamol normon 1g', 'termalgin 650', 'gelocatil 1g sobres',
      'efferalgan 1g efervescente', 'metamizol stada 575', 'nolotil capsulas duras', 'nolotil ampollas bebibles', 'enantyum comprimidos 25',
      'neobrufen 600 sobres', 'espidifen 600 granulado', 'saetil 600', 'actromadol 660', 'voltaren retardo 75',
      'voltadol forte gel', 'bengay crema termica', 'reflex spray aerosol frio', 'trombocid forte pomada', 'menaven gel heparina',
      'traumeel pomada arnica', 'arnidol stick golpe', 'frenadol complex sobres', 'couldina efervescente paracetamol', 'couldina con aspirina',
      'termalgin gripe sobres', 'bisolvon antitusivo jarabe', 'mucosan jarabe flemas', 'flumil 200 sobres', 'flumil forte 600 cinfa',
      'acetilcisteina sandoz 600', 'respibien spray descongestivo', 'utabon adultos nebulizador', 'rhinospray nebulizador tramazolina', 'sinomarin spray agua marina',
      'fisiomer spray nasal', 'rhinomer fuerza 3', 'nebulizador omron de compresor', 'camara inhalacion aerochamber', 'ventolin suspension inhalacion',
      'pulmicort turbuhaler budesonida', 'budesonida nebulizador', 'symbicort turbuhaler', 'montelukast cinfa 10', 'ebastina bucodispersable',
      'ebastel forte flas', 'bilastina bilaxten 20', 'polaramine comprimidos', 'fenistil gel picaduras', 'calmante picaduras afterbite',
      'relec extra fuerte spray', 'autan family care spray', 'omeprazol cinfa 20 capsulas', 'pantoprazol sandoz 40', 'esomeprazol cinfa',
      'famotidina normon 40', 'almax forte suspension oral', 'gaviscon forte suspension anís', 'rennie masticable menta', 'aerored forte capsulas',
      'pankreoflat enzimas pancreáticas', 'fortasec plus comprimidos', 'hidrasec capsulas antidiarreico', 'casenbiotic sobres limon', 'lactoflora protector intestinal',
      'megalevure sobres', 'duphalac sobres lactulosa', 'movicol sobres macrogol', 'plantaben sobres naranja', 'fave de fuca comprimidos sen',
      'evacuol gotas laxantes', 'dulcolaxo bisacodilo', 'micralax canulas microenema', 'enema casen 250ml', 'sal de frutas eno limon',
      'bicarbonato sodico medicinal', 'digestomen comprimidos', 'primperan comprimidos metoclopramida', 'motilium comprimidos domperidona', 'cidine comprimidos cinitaprida',
      'biodramina comprimidos mareo', 'biodramina infantil jarabe', 'biodramina con cafeina', 'colutorio lacer clorhexidina', 'pasta dental lacer fluor',
      'bexident encias triclosan', 'bexident clorhexidina colutorio', 'parodontax sangrado encias', 'sensodyne pro esmalte', 'sensodyne rapida accion',
      'colgate total 12', 'oral-b pro expert', 'oral-b recambios crossaction', 'cepillo electrico oral b pro', 'cepillos interprox plus conico',
      'interprox micro verde', 'seda dental lacer fluor', 'hilo dental oral b essential', 'pasta fijadora corega sin sabor', 'fijador kukident pro neutro',
      'pastillas efervescentes corega', 'pastillas retainer brite retenedores', 'cera ortodoncia brackets', 'gel bioadhesivo lacer aftas', 'aloclair plus spray bucal',
      'aftamed gel oral aplicador', 'bucometasana comprimidos garganta', 'strepsils lidocaina dolor garganta', 'angileptol pastillas chupar', 'lizipaina comprimidos clorhexidina',
      'spray propoleo pranarom', 'durex natural comfort 24', 'durex sensatez invisible', 'durex fresa preservativos', 'durex retard benzocaina',
      'control finissimo adaptabilidad', 'preservativos skyn elite sin latex', 'gel lubricante durex naturals', 'lubricante durex efecto calor', 'lubricante control play aloe',
      'clearblue deteccion temprana', 'clearblue digital semanas', 'test ovulacion clearblue digital', 'copa menstrual enna cycle', 'braguitas menstruales lavables',
      'tampax pearl regular aplicador', 'tampax pearl super absorbentes', 'compresas ausonia evax noche', 'compresas evax liberty flexicel', 'salvaslips evax diarios maxi',
      'gel intimo melagyn arbol del te', 'jabon intimo saforelle bardana', 'gel cumlaude gineseda hidratante', 'hidratante vaginal ainara gel', 'gine-canesten crema vaginal 2%',
      'vagisil crema calmante picor', 'ir a la farmacia', 'compra en la farmacia', 'comprar en farmacia', 'pastillas de la farmacia',
      'receta del medico', 'medico de cabecera', 'consulta de urgencias'
    ]
  },

  food_supermarket: {
    categoryIds: ['cat-2'],
    categoryMatch: ['supermercado', 'alimentac', 'comida', 'grocer', 'food', 'market', 'compras', 'despensa'],
    keywords: [
      'mercadona', 'carrefour', 'lidl', 'dia', 'aldi',
      'eroski', 'alcampo', 'super', 'supermercado', 'hipercor',
      'corte ingles', 'consum', 'bonpreu', 'esclat', 'caprabo',
      'ahorramas', 'froiz', 'gadis', 'bm supermercados', 'coviran',
      'spar', 'leclerc', 'makro', 'costco', 'sanchez romero',
      'veritas', 'supercor', 'family cash', 'dani', 'masymas',
      'condis', 'charter', 'trebol', 'hiperdino', 'hiber',
      'supeco', 'cash fresh', 'el jamon', 'la sirena', 'ametller',
      'casa ametller', 'walmart', 'trader joe', 'whole foods', 'kroger',
      'safeway', 'publix', 'target', 'tesco', 'sainsbury',
      'asda', 'morrisons', 'waitrose', 'marks and spencer', 'coop',
      'rewe', 'edeka', 'auchan', 'albert heijn', '7-eleven',
      'herbolario', 'super asiatico', 'tienda china', 'colmado', 'ultramarinos',
      'badulaque', 'carniceria', 'carne', 'ternera', 'pollo',
      'pechuga', 'pechugas', 'muslos pollo', 'alitas pollo', 'pavo',
      'cerdo', 'lomo', 'cinta de lomo', 'costillas', 'chuletas',
      'chuleton', 'entrecot', 'solomillo', 'carne picada', 'hamburguesas',
      'salchichas', 'frankfurt', 'chorizo', 'longaniza', 'morcilla',
      'butifarra', 'fuet', 'espetec', 'salchichon', 'jamon serrano',
      'jamon iberico', 'jamon york', 'jamon cocido', 'pechuga pavo', 'fiambre',
      'embutido', 'panceta', 'bacon', 'torreznos', 'albondigas',
      'pescaderia', 'pescado', 'merluza', 'salmon', 'atun',
      'bonito', 'dorada', 'lubina', 'bacalao', 'pez espada',
      'emperador', 'sardinas', 'boquerones', 'anchoas', 'calamares',
      'chipirones', 'sepia', 'pulpo', 'gambas', 'langostinos',
      'mejillones', 'almejas', 'berberechos', 'navajas', 'palitos cangrejo',
      'surimi', 'gulas', 'fruteria', 'verduleria', 'fruta',
      'frutas', 'verdura', 'verduras', 'platanos', 'bananas',
      'manzanas', 'peras', 'naranjas', 'mandarinas', 'limones',
      'lima', 'fresas', 'fresones', 'arandanos', 'frambuesas',
      'moras', 'uvas', 'cerezas', 'melocoton', 'nectarina',
      'albaricoque', 'ciruelas', 'sandia', 'melon', 'pina',
      'kiwi', 'aguacate', 'aguacates', 'mango', 'papaya',
      'tomates', 'tomate frito', 'tomate triturado', 'tomate cherry', 'lechuga',
      'iceberg', 'canonigos', 'rucula', 'espinacas', 'acelgas',
      'patatas', 'papas', 'cebollas', 'cebolletas', 'ajos',
      'ajo', 'zanahorias', 'calabacin', 'berenjena', 'pimientos',
      'pimiento verde', 'pimiento rojo', 'pepino', 'puerro', 'brocoli',
      'coliflor', 'col', 'repollo', 'alcachofas', 'esparragos',
      'champinones', 'setas', 'calabaza', 'maiz', 'panaderia',
      'pan', 'barra pan', 'barra rustica', 'pan de molde', 'pan molde',
      'pan integral', 'pan centeno', 'pan burger', 'pan perrito', 'baguette',
      'picos', 'colines', 'reganas', 'tostadas', 'biscotes',
      'croissant', 'croissants', 'cruasan', 'napolitana', 'ensaimada',
      'palmera chocolate', 'magdalenas', 'muffins', 'galletas', 'galletas maria',
      'oreo', 'digestive', 'bizcocho', 'tarta', 'pasteles',
      'empanada', 'empanadillas', 'churros', 'porras', 'huevos',
      'docena huevos', 'docena de huevos', 'leche', 'leche entera', 'leche desnatada',
      'leche semidesnatada', 'leche avena', 'leche soja', 'leche almendras', 'yogures',
      'yogur griego', 'kefir', 'actimel', 'natillas', 'flan',
      'queso', 'queso rallado', 'parmesano', 'gouda', 'manchego',
      'queso fresco', 'mozzarella', 'burrata', 'mascarpone', 'queso cabra',
      'brie', 'camembert', 'philadelphia', 'mantequilla', 'margarina',
      'nata cocinar', 'nata montar', 'arroz', 'arroz bomba', 'arroz basmati',
      'pasta', 'macarrones', 'espaguetis', 'tallarines', 'espirales',
      'fideos', 'lasana', 'lentejas', 'garbanzos', 'alubias',
      'judias', 'harina', 'harina trigo', 'levadura', 'azucar',
      'azucar moreno', 'sacarina', 'miel', 'sal', 'sal marina',
      'aceite de oliva', 'aceite oliva', 'aove', 'aceite girasol', 'vinagre',
      'vinagre modena', 'mayonesa', 'ketchup', 'mostaza', 'salsa soja',
      'tomate bote', 'conservas', 'latas atun', 'aceitunas', 'pepinillos',
      'especias', 'oregano', 'pimienta', 'pimenton', 'curry',
      'canela', 'caldo pollo', 'avecrem', 'gazpacho', 'salmorejo',
      'cafe molido', 'cafe grano', 'capsulas cafe', 'nespresso', 'dolce gusto',
      'infusiones', 'manzanilla', 'poleo menta', 'te verde', 'colacao',
      'nesquik', 'cereales', 'avena', 'muesli', 'mermelada',
      'crema cacahuete', 'nocilla', 'nutella', 'patatas fritas', 'chips',
      'doritos', 'lays', 'frutos secos', 'nueces', 'almendras',
      'pistachos', 'chocolate', 'tableta chocolate', 'agua mineral', 'garrafa agua',
      'coca cola', 'fanta', 'aquarius', 'zumo naranja', 'pack cervezas',
      'vino tinto', 'vino blanco', 'cerveza mahou', 'estrella galicia', 'compra semanal',
      'groceries', 'grocery', 'supermarket', 'deli', 'produce',
      'bakery', 'butcher', 'grocery shopping', 'trader joes', 'costco wholesale',
      'walmart grocery', 'target grocery', 'aldi grocery', 'sainsburys', 'chicken breast',
      'chicken thighs', 'chicken wings', 'ground beef', 'minced meat', 'beef steak',
      'sirloin', 'ribeye', 'pork chops', 'pork loin', 'bacon strips',
      'sausages', 'hot dogs', 'turkey breast', 'deli meat', 'sliced ham',
      'prosciutto', 'salami', 'salmon fillets', 'tuna steak', 'canned tuna',
      'cod fish', 'shrimp', 'prawns', 'calamari', 'crab sticks',
      'scallops', 'mussels', 'dozen eggs', 'whole milk', 'skim milk',
      'low fat milk', 'almond milk', 'oat milk', 'soy milk', 'coconut milk',
      'greek yogurt', 'plain yogurt', 'cheddar cheese', 'parmesan cheese', 'mozzarella cheese',
      'cream cheese', 'sliced cheese', 'butter', 'margarine', 'heavy cream',
      'sour cream', 'white bread', 'whole wheat bread', 'sourdough bread', 'bagels',
      'english muffins', 'pita bread', 'tortilla wraps', 'white rice', 'brown rice',
      'basmati rice', 'jasmine rice', 'spaghetti', 'penne', 'macaroni',
      'lasagna noodles', 'egg noodles', 'canned beans', 'black beans', 'chickpeas',
      'lentils', 'all purpose flour', 'baking powder', 'granulated sugar', 'brown sugar',
      'olive oil', 'extra virgin olive oil', 'canola oil', 'vegetable oil', 'balsamic vinegar',
      'apple cider vinegar', 'mayonnaise', 'mustard', 'soy sauce', 'hot sauce',
      'bbq sauce', 'tomato sauce', 'canned tomatoes', 'crushed tomatoes', 'tomato paste',
      'apples', 'oranges', 'lemons', 'limes', 'strawberries',
      'blueberries', 'raspberries', 'grapes', 'watermelon', 'cantaloupe',
      'pineapple', 'avocados', 'tomatoes', 'cucumbers', 'iceberg lettuce',
      'romaine lettuce', 'baby spinach', 'kale', 'broccoli', 'cauliflower',
      'carrots', 'potatoes', 'sweet potatoes', 'yellow onions', 'red onions',
      'green onions', 'garlic cloves', 'mushrooms', 'bell peppers', 'zucchini',
      'asparagus', 'green beans', 'corn', 'breakfast cereal', 'rolled oats',
      'granola', 'peanut butter', 'jam', 'honey', 'coffee beans',
      'ground coffee', 'k-cup pods', 'tea bags', 'green tea', 'black tea',
      'sparkling water', 'bottled water', 'soda', 'coca-cola', 'diet coke',
      'ginger ale', 'lemonade', 'orange juice', 'apple juice', 'potato chips',
      'tortilla chips', 'pretzels', 'popcorn', 'mixed nuts', 'almonds',
      'cashews', 'peanuts', 'cookies', 'chocolate bar', 'gummy candy',
      'pan de barra', 'bolleria', 'tortilla de patatas', 'sobrasada', 'pate',
      'lomo embuchado', 'jamon de bellota', 'anchoas del cantabrico', 'atun claro en aceite', 'ventresca',
      'esparragos blancos', 'alcachofas en conserva', 'aceite de oliva virgen extra', 'pimenton de la vera', 'oregano seco',
      'perejil fresco', 'tomillo', 'romero', 'comino molido', 'azafran en hebra',
      'pastillas avecrem', 'caldo de pollo aneto', 'garbanzos cocidos bote', 'lentejas cocidas bote', 'alubias blancas cocidas',
      'fideua', 'estrellitas para sopa', 'levadura fresca royal', 'bicarbonato alimentario', 'azucar glass',
      'stevia liquida', 'dulce de leche', 'leche condensada', 'leche evaporada', 'horchata de chufa',
      'fartons', 'sidra asturiana', 'cava brut nature', 'mosto', 'zumo de pina',
      'zumo de melocoton', 'batido de chocolate', 'batido de fresa', 'queso curado manchego', 'tortitas de maiz',
      'tortitas de arroz', 'edamame', 'tofu firme', 'seitán', 'soja texturizada',
      'guacamole fresco', 'pesto genovese', 'salsa alioli', 'picos camperos', 'reganas de ajonjoli',
      'hielo bolsa', 'cebolla morada', 'chalota', 'puerros', 'cebollino',
      'albahaca fresca', 'cilantro fresco', 'eneldo', 'romero fresco', 'tomillo fresco',
      'hierbabuena fresca', 'jengibre fresco', 'curcuma fresca', 'pimienta negra molida', 'pimenton dulce',
      'pimenton picante', 'cayena guindilla', 'jalapenos', 'espinacas frescas', 'acelgas frescas',
      'borraja', 'col rizada', 'canorigos', 'rucula fresca', 'lechuga romana',
      'lechuga batavia', 'cogollos de tudela', 'escarola', 'endivias', 'alcachofas frescas',
      'esparragos verdes', 'esparragos trigueros', 'champinon portobello', 'shiitake', 'boletus',
      'setas de cardo', 'niscalos', 'calabacin verde', 'berenjena negra', 'calabaza cacahuete',
      'calabaza potimarron', 'pepino holandes', 'pimiento italiano', 'pimiento morron', 'pimientos de padron',
      'tomates raf', 'tomate kumato', 'tomate rosa', 'tomates pera', 'tomates cherry',
      'zanahorias baby', 'remolacha cocida', 'maiz dulce', 'judias verdes', 'guisantes congelados',
      'edamame congelado', 'manzanas golden', 'manzanas fuji', 'manzanas royal gala', 'peras conferencia',
      'platano de canarias', 'naranjas de zumo', 'naranjas de mesa', 'mandarinas clementinas', 'pomelo rosa',
      'fresas de huelva', 'arandanos silvestres', 'frambuesas frescas', 'moras frescas', 'cerezas picotas',
      'ciruelas rojas', 'albaricoques frescos', 'melocoton amarillo', 'paraguayos', 'nectarinas frescas',
      'sandia sin pepitas', 'melon piel de sapo', 'melon cantalupo', 'pina natural', 'kiwis zespri',
      'kiwi amarillo', 'aguacate hass', 'mango maduro', 'papaya fresca', 'fruta de la pasion',
      'chirimoya', 'granada', 'caqui persimon', 'higos frescos', 'uvas blancas sin pepitas',
      'uvas negras', 'datiles medjool', 'contramuslos deshuesados', 'alitas marinadas', 'pollo entero',
      'pollo asado', 'solomillo de pavo', 'ternera para guisar', 'carne picada mixta', 'picada de ternera',
      'filetes de ternera', 'carrilleras de ternera', 'rabo de toro', 'solomillo de cerdo', 'secreto iberico',
      'pluma iberica', 'presa iberica', 'costillas de cerdo adobadas', 'torreznos de soria', 'jamon serrano bodega',
      'jamon iberico de cebo', 'paletilla iberica', 'jamon cocido extra', 'pechuga de pavo braseada', 'mortadela siciliana con pistacho',
      'salchichon iberico', 'fuet espetec', 'chistorra', 'morcilla de burgos', 'morcilla de arroz',
      'butifarra blanca', 'butifarra negra', 'sobrasada mallorquina', 'pate de pato', 'foie gras mi-cuit',
      'salchichas bratwurst', 'albondigas caseras', 'lubina fresca', 'dorada fresca', 'rodaballo',
      'lenguado fresco', 'gallo pescado', 'rape fresco', 'merluza de pincho', 'pescadilla fresca',
      'bacalao fresco', 'lomos de bacalao', 'salmon noruego', 'atun rojo fresco', 'bonito del norte fresco',
      'corvina fresca', 'trucha asalmonada', 'sardinas frescas', 'boquerones frescos', 'caballa fresca',
      'chipirones frescos', 'sepia limpia', 'pulpo cocido', 'patas de pulpo', 'rabas de calamar',
      'gamba blanca', 'gamba roja', 'langostinos tigre', 'cigalas frescas', 'bogavante vivo',
      'buey de mar', 'necoras', 'percebes gallegos', 'mejillones de roca', 'almejas chirlas',
      'berberechos frescos', 'navajas frescas', 'zamburinas', 'vieiras frescas', 'gulas del norte',
      'huevos camperos', 'huevos ecologicos', 'claras de huevo pasteurizadas', 'leche entera pascual', 'leche desnatada asturiana',
      'leche semidesnatada kaiku', 'leche sin lactosa', 'leche de avena barista', 'bebida de avena', 'bebida de soja',
      'bebida de almendras', 'bebida de arroz', 'kefir de cabra', 'yogur bifidus', 'danonino',
      'natillas con galleta', 'arroz con leche casero', 'cuajada con miel', 'queso manchego curado', 'queso semicurado',
      'queso idiazabal', 'queso tetilla', 'queso azul roquefort', 'gorgonzola cremoso', 'parmesano reggiano',
      'grana padano', 'pecorino romano', 'mozzarella di bufala', 'burrata fresca', 'mascarpone italiano',
      'ricotta fresca', 'requeson pasteurizado', 'rulo queso de cabra', 'queso brie presidente', 'queso camembert',
      'queso feta griego', 'queso havarti', 'tranchetes queso', 'mantequilla con sal kerrygold', 'mantequilla sin sal',
      'margarina tulipan', 'nata para cocinar', 'nata para montar', 'nata en spray', 'barra de pan rustica',
      'pan de masa madre', 'pan de chapata', 'baguette recien horneada', 'pan de molde 100% integral', 'pan de centeno aleman',
      'pan de espelta', 'pan bao', 'pan de hamburguesa brioche', 'pan de perrito caliente', 'tortillas de trigo fajitas',
      'tortillas de maiz tacos', 'picos camperos aove', 'reganas sevillanas', 'colines de pan', 'croissants de mantequilla',
      'napolitana de chocolate', 'napolitana de crema', 'ensaimada mallorquina', 'palmeras de hojaldre', 'magdalenas caseras',
      'muffins de arandanos', 'galletas fontaneda', 'galletas campurrianas', 'galletas chiquilin', 'galletas principe de chocolate',
      'torta de anis', 'sobaos pasiegos', 'quesada pasiega', 'churros congelados', 'porras madrilenas',
      'gofres belgas', 'tortitas americanas', 'sirope de arce', 'mermelada de fresa hero', 'mermelada de melocoton',
      'miel de romero', 'miel milflores', 'crema de cacahuete 100%', 'crema de almendras', 'cacao en polvo valor',
      'cafe molido descafeinado', 'cafe soluble nescafe', 'capsulas cafe nespresso', 'capsulas dolce gusto', 'te earl grey',
      'te chai especiado', 'rooibos vainilla', 'manzanilla con anis', 'tila alpina', 'copos de avena suaves',
      'muesli crujiente chocolate', 'cereales special k', 'cereales chocapic', 'arroz redondo la fallera', 'arroz bomba sos',
      'arroz basmati sundari', 'arroz para risotto', 'pasta gallo plumas', 'macarrones barilla', 'espaguetis barilla',
      'tagliatelle al huevo', 'fideos cabellin', 'laminas de lasana', 'canelones para rellenar', 'gnocchi de patata',
      'lentejas pardinas la asturiana', 'garbanzos pedrosillano', 'alubias blancas rinon', 'fabes asturianas', 'harina de repostería',
      'harina de fuerza pizza', 'harina de maiz maizena', 'pan rallado crujiente', 'levadura prensada levital', 'azucar blanco azucarera',
      'sal fina marina', 'sal en escamas maldon', 'vinagre de jerez reserva', 'vinagre balsamico modena', 'crema de vinagre',
      'aceite virgen extra picual', 'aove arbequina', 'mayonesa hellmanns', 'ketchup heinz bote', 'mostaza antigua dijon',
      'salsa barbacoa hunts', 'salsa teriyaki', 'salsa sriracha', 'tabasco original', 'salsa cesar ybarra',
      'tomate frito orlando', 'tomate estilo casero hida', 'tomate triturado mutti', 'sofrito de tomate', 'aceitunas rellenas serpis',
      'aceitunas gordal con hueso', 'aceitunas negras cacerenas', 'pepinillos agridulces', 'banderillas picantes', 'alcaparras en vinagre',
      'altramuces', 'patatas fritas lays gourmet', 'patatas ruffles jamon', 'doritos tex-mex', 'cheetos pelotazos',
      'frutos secos borges', 'nueces peladas', 'almendras tostadas', 'pistachos con sal', 'anacardos crudos',
      'avellanas tostadas', 'pipas tijuana grefusa', 'chocolate negro 85% lindt', 'chocolate nestle extrafino', 'bombones ferrero rocher',
      'toblerone', 'agua solan de cabras', 'agua bezoya garrafa', 'agua font vella 6l', 'agua vichy catalan',
      'perrier con gas', 'san pellegrino con gas', 'coca cola zero zero', 'pepsi max lata', 'fanta de naranja zero',
      'fanta limon zero', 'sprite refresco', 'aquarius limon zero', 'nestea al limon', 'monster energy lata',
      'red bull lata', 'tonica schweppes original', 'zumo de naranja exprimido', 'zumo don simon', 'cacaolat batido chocolate',
      'batido vainilla puleva', 'cerveza mahou cinco estrellas', 'cerveza voll damm doble malta', 'cerveza alhambra reserva 1925', 'cerveza estrella galicia especial',
      'cerveza heineken lata', 'cerveza coronita', 'cerveza 1906 reserva', 'cerveza sin alcohol 00 tostada', 'vino rioja crianza',
      'vino ribera del duero roble', 'vino rueda verdejo', 'vino albarino rias baixas', 'vino godello', 'cava freixenet carta nevada',
      'cava codorniu', 'comprar pan', 'compre pan', 'hacer la compra', 'hacer compra',
      'compra del super', 'compra de la semana', 'compra del mes', 'la compra semanal', 'supermercado compra',
      'super del barrio', 'grocery store', 'grocery run', 'supermarket run', 'weekly groceries',
      'grocery order', 'pescanova', 'buitoni', 'findus', 'dr oetker',
      'casa tarradellas', 'el pozo', 'campofrio', 'navidul', 'revilla',
      'central lechera asturiana', 'pascual', 'danone', 'nestle', 'milka',
      'valor', 'lindt', 'churreria', 'pasteleria', 'panaderia artesanal',
      'gominolas', 'chuches', 'chicles', 'orbit', 'trident',
      'caramelos', 'mentas', 'halls', 'smint', 'lays campesinas',
      'doritos dippas', 'ruffles jamon', 'cheetos', 'risketos', 'zumo de tomate',
      'kombucha', 'te kombucha', 'semillas de chia', 'semillas de lino', 'quinoa real',
      'copos de maiz', 'leche de coco lata', 'curry madras', 'garam masala', 'wasabi',
      'hierbas provenzales', 'salsa brava', 'salsa alioli chovi', 'tomate frito casero', 'garbanzos con espinacas',
      'lentejas a la riojana', 'fabada asturiana litoral', 'cocido madrileno litoral', 'crema de verduras knorr', 'sopa de fideos gallina blanca',
      'caldo de pescado aneto', 'caldo de verduras', 'gelatina royal', 'flan dhul', 'helados magnum',
      'helado cornetto', 'helado ben & jerrys', 'helado haagen dazs', 'tarta comtessa'
    ]
  },

  dining_leisure: {
    categoryIds: ['cat-6'],
    categoryMatch: ['ocio', 'restauran', 'cenas fuera', 'dining', 'drink', 'cafe', 'salidas', 'bares'],
    keywords: [
      'restaurante', 'restaurant', 'cena', 'cenar', 'dinner',
      'comida fuera', 'lunch', 'almuerzo', 'desayuno', 'breakfast',
      'brunch', 'picoteo', 'tapeo', 'salir de tapas', 'aperitivo',
      'vermu', 'vermut', 'menu del dia', 'menu degustacion', 'raciones',
      'bar', 'tasca', 'taberna', 'taperia', 'meson',
      'chiringuito', 'terraza bar', 'bar de copas', 'cafeteria', 'cafe',
      'cortado', 'cafe con leche', 'cappuccino', 'cerveza', 'cervezas',
      'canas', 'doble cerveza', 'tercio', 'botellin', 'jarra cerveza',
      'beer', 'copas', 'cubata', 'gintonic', 'roncola',
      'vino copa', 'tinto de verano', 'sangria', 'cocktail', 'cocktails',
      'mojito', 'chupito', 'chupitos', 'discoteca', 'pub',
      'entrada discoteca', 'reservado', 'fiesta', 'party', 'pizzeria',
      'pizza', 'trattoria', 'burger', 'hamburguesa', 'smash burger',
      'sushi', 'ramen', 'wok', 'comida asiatica', 'mexicano',
      'tacos', 'burrito', 'kebab', 'shawarma', 'falafel',
      'marisqueria', 'asador', 'heladeria', 'ice cream', 'mcdonalds',
      'burger king', 'kfc', 'popeyes', 'subway', 'dominos',
      'telepizza', 'starbucks', 'five guys', 'taco bell', 'vips',
      'fosters hollywood', 'ginos', 'goiko', 'goiko grill', '100 montaditos',
      'tagliatella', 'lateral', 'honest greens', 'rodilla', 'pans & company',
      'glovo', 'uber eats', 'just eat', 'deliveroo', 'doordash',
      'takeaway', 'delivery', 'comida domicilio', 'pedir comida', 'cine',
      'cinema', 'cinesa', 'yelmo cines', 'kinepolis', 'entradas cine',
      'palomitas cine', 'concierto', 'concert', 'entradas concierto', 'festival musica',
      'abono festival', 'teatro', 'theater', 'musical', 'el rey leon',
      'entradas teatro', 'monologo', 'comedy club', 'museo', 'museum',
      'entradas museo', 'prado', 'reina sofia', 'exposicion', 'planetario',
      'acuario', 'zoo', 'parque atracciones', 'warner', 'portaventura',
      'isla magica', 'escape room', 'bolera', 'bolos', 'karting',
      'minigolf', 'laser tag', 'paintball', 'fine dining', 'casual dining',
      'dinner date', 'lunch special', 'business lunch', 'breakfast buffet', 'sunday brunch',
      'tasting menu', 'three course meal', 'outdoor patio', 'coffee shop', 'espresso',
      'americano', 'flat white', 'iced latte', 'cold brew', 'iced tea',
      'chai latte', 'hot chocolate', 'bakery cafe', 'pastry', 'croissant',
      'draft beer', 'craft beer', 'ipa beer', 'lager', 'pilsner',
      'stout beer', 'bottle of beer', 'glass of wine', 'bottle of wine', 'red wine',
      'pinot noir', 'cabernet', 'white wine', 'chardonnay', 'sauvignon blanc',
      'rose wine', 'champagne', 'prosecco', 'sparkling wine', 'margarita',
      'old fashioned', 'moscow mule', 'gin and tonic', 'vodka soda', 'shots',
      'bar tab', 'pub food', 'gastropub', 'sports bar', 'nightclub cover',
      'vip table', 'food delivery', 'takeout order', 'curbside pickup', 'fast food drive-thru',
      'pizza slice', 'pepperoni pizza', 'artisan pizza', 'cheeseburger', 'bacon burger',
      'french fries', 'onion rings', 'sushi rolls', 'sashimi', 'spicy ramen',
      'noodle soup', 'pad thai', 'fried rice', 'chicken tikka masala', 'naan bread',
      'street tacos', 'carnitas', 'burrito bowl', 'quesadilla', 'nachos platter',
      'falafel wrap', 'gyro pita', 'doner kebab', 'ice cream cone', 'gelato',
      'frozen yogurt', 'milkshake', 'movie ticket', 'imax ticket', 'popcorn and soda',
      'broadway show', 'theater tickets', 'concert tickets', 'music festival pass', 'museum admission',
      'art gallery entry', 'aquarium ticket', 'zoo admission', 'amusement park pass', 'rollercoaster',
      'bowling alley', 'bowling shoes', 'arcade tokens', 'escape room booking', 'go kart race',
      'unas canas', 'tomar canas', 'ir de canas', 'de canas con amigos', 'unas birras',
      'tomar birras', 'tomar cervezas', 'cervecitas en la terraza', 'cenita rica', 'cenita fuera',
      'salir a cenar', 'salir a comer', 'comida con amigos', 'comida de trabajo', 'comilona de fin de semana',
      'tapeito rico', 'ir de tapas', 'unas tapas en el bar', 'tomar un cafe', 'cafecito y tostada',
      'merendola', 'merendar fuera', 'copitas de noche', 'unos cubatas', 'copas en la discoteca',
      'vermucito del domingo', 'tomar el vermu', 'vermu con aceitunas', 'pedir al glovo', 'pedido de uber eats',
      'cena a domicilio', 'comida china a domicilio', 'pizzas para cenar', 'hamburguesas para cenar', 'sushi a domicilio',
      'entradas de cine', 'ir al cine', 'entradas para el concierto', 'ir al teatro', 'partida de bolos',
      'sala de escape', 'tomar helado', 'ir a la heladeria', 'coffee run', 'morning coffee grab',
      'iced latte run', 'grabbed coffee', 'grabbed lunch', 'grabbed dinner', 'dinner out with friends',
      'eating out tonight', 'dining out with family', 'drinks after work', 'happy hour beers', 'cocktails at rooftop',
      'weekend brunch date', 'ordered takeout', 'uber eats order', 'doordash delivery', 'grabbed takeout',
      'movie tickets imax', 'concert tickets show', 'comedy club tickets'
    ]
  },

  transport_gas: {
    categoryIds: ['cat-5'],
    categoryMatch: ['transporte', 'gasolina', 'combustible', 'coche', 'transport', 'fuel', 'auto', 'vehiculo'],
    keywords: [
      'gasolina', 'gasoil', 'diesel', 'sin plomo 95', 'sp95',
      'sin plomo 98', 'sp98', 'combustible', 'carburante', 'repostar',
      'repostaje', 'llenar deposito', 'gasolinera', 'repsol', 'cepsa',
      'bp', 'galp', 'shell', 'petroprix', 'plenoil',
      'ballenoil', 'campsa', 'avia', 'gasoline', 'petrol',
      'fuel', 'glp', 'gnc', 'adblue', 'cargador electrico',
      'supercharger', 'electrolinera', 'tesla charge', 'ionity', 'endesa way',
      'parking', 'aparcamiento', 'estacionamiento', 'parking subterraneo', 'parquimetro',
      'zona azul', 'zona verde', 'zona ser', 'telpark', 'easypark',
      'elparking', 'peaje', 'autopista', 'toll', 'via-t',
      'bip&drive', 'telepeaje', 'itv', 'cita itv', 'taller',
      'taller mecanico', 'mecanico', 'mechanic', 'revision coche', 'cambio aceite',
      'filtro aceite', 'oil change', 'cambio neumaticos', 'ruedas', 'neumaticos',
      'tires', 'pinchazo', 'bateria coche', 'pastillas freno', 'liquido frenos',
      'anticongelante', 'norauto', 'feu vert', 'midas', 'aurgi',
      'euromaster', 'lavado coche', 'lavar el coche', 'lavar coche', 'lavadero coche', 'tren lavado', 'autolavado', 'car wash',
      'limpiaparabrisas', 'escobillas coche', 'metro', 'subway', 'bono metro',
      'tarjeta transporte', 'abono transportes', 't-usual', 't-casual', 'autobus',
      'bus', 'bus urbano', 'emt', 'tmb', 'alsa',
      'avanza', 'socibus', 'monbus', 'flixbus', 'tren',
      'train', 'cercanias', 'rodalies', 'renfe', 'ave',
      'avlo', 'ouigo', 'iryo', 'billete tren', 'tranvia',
      'tram', 'uber', 'cabify', 'bolt', 'freenow',
      'taxi', 'radiotaxi', 'blablacar', 'amovens', 'zity',
      'sharenow', 'free2move', 'bicimad', 'bicing', 'valenbisi',
      'patinete electrico', 'alquiler bici', 'lime', 'dott', 'tier',
      'unleaded gas', 'regular gas', 'premium gas', 'diesel fuel', 'gas station fill up',
      'gas pump', 'ev charging station', 'tesla supercharger', 'electrify america', 'evgo charger',
      'chargepoint', 'parking garage', 'parking meter', 'street parking', 'airport parking',
      'valet parking', 'monthly parking permit', 'toll road fee', 'express toll', 'turnpike toll',
      'ez-pass reload', 'fas-trak', 'oil change service', 'synthetic oil change', 'oil filter replacement',
      'engine air filter', 'cabin air filter', 'tire rotation', 'wheel alignment', 'wheel balancing',
      'new tire set', 'all season tires', 'winter tires', 'tire puncture repair', 'flat tire fix',
      'car battery replacement', 'brake pads replacement', 'brake rotor resurfacing', 'transmission fluid flush', 'radiator coolant flush',
      'spark plugs replacement', 'windshield wiper blades', 'wiper fluid refill', 'annual car inspection', 'emissions test',
      'smog check', 'auto body shop', 'dent repair', 'windshield replacement', 'automatic car wash',
      'hand car wash', 'car detailing service', 'interior vacuuming', 'subway fare', 'metrocard refill',
      'transit card reload', 'bus fare', 'city bus pass', 'commuter rail ticket', 'amtrak train ticket',
      'train conductor', 'light rail pass', 'ferry ticket', 'taxi fare', 'yellow cab',
      'uber ride', 'uber xl', 'lyft ride', 'lyft xl', 'shared rideshare',
      'carpool app', 'airport shuttle', 'electric scooter unlock', 'bird scooter', 'lime bike rental',
      'city bike annual pass', 'echar gasolina', 'echar gasoil', 'echar gasofa', 'llenar el deposito',
      'deposito lleno coche', 'reposte gasolina', 'repostar diesel', 'gasolinera cepsa repsol', 'lavar el coche en lavadero',
      'tunel de lavado coche', 'aspirar el coche', 'multa de aparcamiento', 'multa de trafico', 'multa de la ota',
      'multa del ser', 'parquimetro ticket', 'pagar el parking', 'parking aeropuerto', 'peaje de la autopista',
      'tarjeta del metro recarga', 'recargar bono transporte', 'billete de autobus urbano', 'billete de ave renfe', 'viaje en uber vtc',
      'viaje en cabify', 'carrera de taxi', 'alquiler de patinete', 'gas fill up', 'filled up gas tank',
      'gas pump visit', 'car wash vacuum', 'parking garage fee', 'parking ticket fine', 'highway toll charge',
      'metro card reload', 'bus ticket transit', 'train fare ticket', 'uber ride airport', 'lyft ride home',
      'cab fare taxi'
    ]
  },

  utilities_bills: {
    categoryIds: ['cat-3'],
    categoryMatch: ['factura', 'suministro', 'luz', 'agua', 'gas', 'wifi', 'utilit', 'bill', 'energia', 'recibo'],
    keywords: [
      'luz', 'electricidad', 'energia', 'factura luz', 'recibo luz',
      'compania electrica', 'iberdrola', 'endesa', 'naturgy', 'totalenergies',
      'repsol luz', 'holaluz', 'som energia', 'octopus energy', 'plenitude',
      'lucera', 'pepeenergy', 'gana energia', 'edp', 'electricity',
      'electric bill', 'power bill', 'gas natural', 'factura gas', 'recibo gas',
      'bombona', 'bombona butano', 'bombona de butano', 'butano', 'propano',
      'repsol butano', 'cepsa gas', 'calefaccion', 'calefaccion central', 'caldera',
      'revision caldera', 'pellets', 'saco lena', 'gas bill', 'heating bill',
      'agua', 'factura agua', 'recibo agua', 'canal de isabel', 'aguas de barcelona',
      'agbar', 'aqualia', 'emasesa', 'facsa', 'aguas de valencia',
      'water bill', 'basura', 'tasa basuras', 'impuesto basuras', 'alcantarillado',
      'saneamiento', 'comunidad vecinos', 'recibo comunidad', 'cuota comunidad', 'pago comunidad',
      'derrama', 'derrama comunidad', 'administrador fincas', 'mantenimiento ascensor', 'hoa fees',
      'internet', 'fibra', 'fibra optica', 'wifi', 'router wifi',
      'telefono fijo', 'telefonia', 'factura movil', 'recibo movil', 'linea movil',
      'gigas extra', 'recarga movil', 'datos movil', 'tarjeta sim', 'esim',
      'digi', 'vodafone', 'movistar', 'o2', 'orange',
      'masmovil', 'pepephone', 'yoigo', 'lowi', 'simyo',
      'jazztel', 'finetwork', 'euskaltel', 'telecable', 'virgin telco',
      'guuk', 'avatel', 'phone bill', 'internet bill', 'residential electric bill',
      'monthly electricity statement', 'conedison bill', 'pge electric bill', 'duke energy bill', 'fpl electricity bill',
      'national grid gas bill', 'natural gas utility bill', 'propane tank delivery', 'heating oil delivery bill', 'city water department bill',
      'municipal water bill', 'sewer and stormwater fee', 'quarterly water utility', 'curbside trash pickup fee', 'recycling collection bill',
      'hoa monthly assessment', 'homeowners association dues', 'condo monthly fee', 'condominium maintenance dues', 'special assessment condo',
      'fiber optic internet service', 'gigabit internet connection', 'xfinity internet bill', 'verizon fios bill', 'att fiber monthly bill',
      'spectrum internet bill', 'cox internet monthly', 'unlimited mobile data plan', 'family cell phone plan', 't-mobile monthly statement',
      'verizon wireless bill', 'att wireless invoice', 'postpaid cellular bill', 'prepaid sim refill', 'international roaming package',
      'factura de la luz endesa', 'factura de la luz iberdrola', 'recibo de la luz mensual', 'factura del agua aqualia', 'recibo del agua canal isabel',
      'factura del gas naturgy', 'bombona de gas butano repsol', 'cuota mensual comunidad propietarios', 'derrama de la comunidad tejado', 'factura de la fibra digi',
      'factura de internet movistar', 'recibo del telefono orange vodafone', 'linea movil pepephone o2', 'electric power bill payment', 'water utility statement',
      'hoa maintenance monthly dues', 'broadband internet monthly invoice', 'cell phone monthly bill'
    ]
  },

  subscriptions_streaming: {
    categoryIds: ['cat-4'],
    categoryMatch: ['suscrip', 'subscript', 'streaming', 'digital', 'membresia', 'cuota'],
    keywords: [
      'netflix', 'spotify', 'hbo', 'hbo max', 'max',
      'disney', 'disney plus', 'disney+', 'amazon prime', 'prime video',
      'apple tv', 'apple music', 'youtube premium', 'youtube music', 'dazn',
      'filmin', 'movistar plus', 'movistar+', 'skyshowtime', 'crunchyroll',
      'tivify', 'rakuten tv', 'atresplayer', 'mitele plus', 'audible',
      'storytel', 'podimo', 'ivoox plus', 'tidal', 'deezer',
      'soundcloud', 'icloud', 'apple one', 'google one', 'google drive',
      'onedrive', 'dropbox', 'microsoft 365', 'office 365', 'adobe',
      'photoshop', 'canva', 'canva pro', 'figma', 'playstation plus',
      'ps plus', 'xbox game pass', 'game pass', 'nintendo switch online', 'steam',
      'chatgpt', 'chatgpt plus', 'openai', 'claude ai', 'claude pro',
      'anthropic', 'midjourney', 'github copilot', 'perplexity', 'notion',
      'notion ai', '1password', 'bitwarden', 'nordvpn', 'expressvpn',
      'surfshark', 'protonmail', 'duolingo', 'duolingo plus', 'super duolingo',
      'patreon', 'substack', 'netflix 4k subscription', 'spotify premium individual', 'spotify family plan',
      'apple music family', 'youtube music individual', 'amazon prime annual renewal', 'hulu ad-free monthly', 'disney bundle trio',
      'hbo max standard monthly', 'peacock premium plus', 'paramount plus showtime', 'apple tv plus monthly', 'espn plus subscription',
      'fubo tv stream', 'sling tv monthly', 'audible monthly credits', 'kindle unlimited reader', 'scribd subscription',
      'new york times digital access', 'wall street journal digital', 'the athletic sports subscription', 'medium membership monthly', 'substack newsletter subscription',
      'patreon monthly pledge', 'apple icloud 2tb plan', 'google one 100gb storage', 'dropbox plus monthly', 'microsoft 365 family annual',
      'adobe creative cloud all apps', 'canva pro team subscription', 'figma professional monthly', 'chatgpt plus subscription fee', 'anthropic claude pro monthly',
      'github copilot personal', 'notion personal plus', 'todoist pro annual', 'evernote premium annual', '1password family membership',
      'dashlane premium subscription', 'nordvpn 2 year plan', 'surfshark vpn annual', 'playstation plus extra 12 months', 'xbox game pass ultimate monthly',
      'nintendo switch online family', 'discord nitro monthly boost', 'twitch channel sub tier 1', 'suscripcion mensual a netflix', 'cuota mensual de spotify',
      'suscripcion a hbo max', 'suscripcion a disney plus', 'cuota de amazon prime anual', 'suscripcion a youtube premium', 'almacenamiento icloud apple',
      'almacenamiento google one', 'suscripcion a chatgpt plus', 'suscripcion a claude pro', 'cuota playstation plus psn', 'xbox game pass suscripcion',
      'monthly netflix charge', 'spotify family membership', 'disney plus subscription', 'amazon prime yearly fee', 'chatgpt plus monthly fee',
      'icloud storage monthly plan', 'playstation plus annual fee'
    ]
  },

  pets: {
    categoryIds: ['cat-mascotas'],
    categoryMatch: ['mascota', 'pet', 'perro', 'gato', 'animal', 'veterinari', 'canino', 'felino'],
    keywords: [
      'veterinario', 'veterinaria', 'vet', 'veterinary', 'clinica veterinaria',
      'hospital veterinario', 'urgencia veterinaria', 'vacuna perro', 'vacuna gato', 'vacuna rabia',
      'desparasitante', 'desparasitar', 'pipeta perro', 'pipeta gato', 'pipeta desparasitante',
      'collar scalibor', 'collar seresto', 'pastilla desparasitar', 'milbemax', 'nexgard',
      'simparica', 'microchip perro', 'microchip gato', 'esterilizacion perro', 'castracion gato',
      'limpieza dental perro', 'seguro mascota', 'barkibu', 'pienso', 'pienso perro',
      'comida perro', 'latas perro', 'comida humeda perro', 'pienso gato', 'comida gato',
      'latas gato', 'dog food', 'cat food', 'pet food', 'royal canin',
      'purina', 'purina one', 'advance perro', 'acana', 'orijen',
      'edgard cooper', 'snacks perro', 'premios perro', 'huesos prensados', 'chuches perro',
      'catisfactions', 'malta gato', 'arena gato', 'arena de gato', 'arenero gato',
      'cat litter', 'rascador gato', 'cama perro', 'cuna gato', 'transportin',
      'jaula perro', 'collar perro', 'correa perro', 'arnes perro', 'arnes julius',
      'bozal', 'comedero', 'comedero perro', 'bebedero', 'fuente gato',
      'juguetes perro', 'pelota perro', 'kong', 'juguetes gato', 'bolsas caca perro',
      'toallitas perro', 'champu perro', 'empapadores perro', 'peluqueria canina', 'bano perro',
      'corte pelo perro', 'tiendanimal', 'kiwoko', 'zooplus', 'miscota',
      'veterinary exam fee', 'annual pet wellness visit', 'dog rabies vaccination', 'cat distemper vaccine', 'heartworm prevention medication',
      'nexgard chewables', 'frontline plus', 'revolution plus for cats', 'flea and tick collar', 'seresto dog collar',
      'dog microchip fee', 'routine pet bloodwork', 'canine teeth cleaning', 'cat spay surgery', 'dog neuter surgery',
      'pet emergency hospital visit', 'dry dog food bag', 'grain free dog food', 'wet canned dog food', 'dry cat food kibble',
      'canned cat food gravy', 'freeze dried dog treats', 'bully sticks dog', 'cat grass kit', 'hairball control paste',
      'unscented clumping cat litter', 'crystal cat litter', 'stainless steel litter box', 'sisal rope cat scratcher', 'orthopedic dog bed',
      'cooling dog mat', 'airline approved pet carrier', 'dog wire crate 36 inch', 'reflective dog leash', 'retractable dog leash',
      'no pull dog harness', 'martingale dog collar', 'personalized pet id tag', 'stainless steel pet bowl', 'ceramic cat water fountain',
      'biodegradable dog poop bags', 'gentle oatmeal dog shampoo', 'pet ear cleaning wipes', 'professional dog grooming', 'veterinario perro consulta',
      'veterinario gato urgencias', 'vacunas del perro cartilla', 'vacuna de la rabia perro', 'pipeta de las pulgas perro', 'collar seresto garrapatas',
      'pienso de perro saco grande', 'comida húmeda latas perro', 'pienso de gato esterilizado', 'latas gourmet gato', 'arena aglomerante gato',
      'limpiar arenero gato', 'rascador de gato poste', 'chuches de perro premios', 'hueso de perro prensado', 'transportin para el gato',
      'correa de perro paseo', 'arnes antitirones perro', 'peluqueria del perro bano', 'cortar el pelo al perro', 'vet visit checkup',
      'dog vaccination shots', 'dog flea medication', 'dog food kibble bag', 'canned wet cat food', 'clumping cat litter box',
      'dog grooming bath haircut', 'dog treats chew bones'
    ]
  },

  home_hardware: {
    categoryIds: ['cat-hogar'],
    categoryMatch: ['hogar', 'casa', 'home', 'mueble', 'bricolaje', 'limpieza', 'decoracion', 'jardin'],
    keywords: [
      'ikea', 'leroy merlin', 'leroy', 'bauhaus', 'brico depot',
      'bricomart', 'obramat', 'conforama', 'maisons du monde', 'zara home',
      'jysk', 'sklum', 'muebles', 'sofa', 'cheslong',
      'sillon', 'mesa comedor', 'mesa centro', 'sillas', 'estanteria',
      'kallax', 'libreria', 'armario', 'comoda', 'sinfonier',
      'mesita noche', 'colchon', 'somier', 'canape', 'almohada',
      'almohadas', 'sabanas', 'funda nordica', 'edredon', 'colcha',
      'toallas', 'cortinas', 'estor', 'alfombra', 'cojines',
      'lampara', 'bombilla led', 'vajilla', 'platos', 'vasos',
      'copas vino', 'copas de vino', 'cubiertos', 'sarten', 'sartenes',
      'sarten antiadherente', 'olla', 'cacerola', 'olla express', 'fuente horno',
      'tupper', 'tupperware', 'fiambrera', 'papel aluminio', 'film transparente',
      'papel horno', 'bolsas congelacion', 'tostadora', 'cafetera', 'hervidor',
      'freidora de aire', 'freidora aire', 'airfryer', 'ferreteria', 'bricolaje',
      'herramientas', 'taladro', 'destornillador', 'llave inglesa', 'martillo',
      'sierra', 'tornillos', 'tuercas', 'tacos fischer', 'clavos',
      'silicona', 'masilla', 'aguaplast', 'pintura', 'brocha',
      'rodillo', 'cinta carrocero', 'pegamento', 'superglue', 'loctite',
      'cerradura', 'cerrajero', 'cambio bombin', 'duplicado llaves', 'persiana',
      'fontanero', 'plumber', 'desatasco', 'desatascador', 'grifo',
      'cisterna', 'electricista', 'enchufe', 'cuadro luces', 'manitas',
      'reparacion casa', 'drogueria', 'limpieza', 'detergente', 'detergente lavadora',
      'ariel', 'skip', 'suavizante', 'mimosin', 'lejia',
      'amoniaco', 'limpiasuelos', 'don limpio', 'fregona', 'cubo fregona',
      'escoba', 'recogedor', 'bayetas', 'microfibra', 'estropajo',
      'fairy', 'fairy lavavajillas', 'pastillas lavavajillas', 'finish', 'desengrasante',
      'kh7', 'limpiacristales', 'pato wc', 'bolsas basura', 'papel higienico',
      'papel cocina', 'servilletas papel', 'insecticida', 'ambientador', 'plantas',
      'maceta', 'macetero', 'tierra plantas', 'abono', 'sustrato',
      'manguera', 'furniture', 'couch', 'sectional', 'armchair',
      'recliner', 'coffee table', 'end table', 'dining table', 'dining chairs',
      'bar stools', 'bookshelf', 'bookcase', 'tv stand', 'credenza',
      'dresser', 'nightstand', 'wardrobe', 'closet organizer', 'bed frame',
      'mattress', 'box spring', 'mattress topper', 'bed sheets', 'fitted sheet',
      'pillowcases', 'duvet cover', 'comforter', 'throw blanket', 'bath towels',
      'hand towels', 'washcloths', 'shower curtain', 'bath mat', 'curtains',
      'drapes', 'window blinds', 'area rug', 'door mat', 'throw pillows',
      'wall art', 'picture frames', 'table lamp', 'floor lamp', 'light bulbs',
      'led bulbs', 'candles', 'reed diffuser', 'dinner plates', 'salad bowls',
      'drinking glasses', 'wine glasses', 'coffee mugs', 'silverware', 'flatware',
      'cutlery set', 'chef knife', 'cutting board', 'frying pan', 'skillet',
      'saucepan', 'stockpot', 'baking sheet', 'casserole dish', 'mixing bowls',
      'colander', 'measuring cups', 'kitchen spatula', 'can opener', 'bottle opener',
      'peeler', 'blender', 'food processor', 'toaster', 'electric kettle',
      'coffee maker', 'espresso machine', 'air fryer', 'slow cooker', 'instant pot',
      'microwave', 'food storage containers', 'tupperware containers', 'ziploc bags', 'aluminum foil',
      'plastic wrap', 'parchment paper', 'hardware store', 'home depot', 'lowes',
      'tool set', 'power drill', 'screwdriver set', 'adjustable wrench', 'claw hammer',
      'tape measure', 'level tool', 'pliers', 'hand saw', 'screws and anchors',
      'nails', 'caulk', 'silicone sealant', 'spackle', 'wall paint',
      'paint brush', 'paint roller', 'drop cloth', 'masking tape', 'duct tape',
      'super glue', 'gorilla glue', 'wd-40', 'step stool', 'extension ladder',
      'padlock', 'door lock', 'deadbolt', 'spare keys', 'drain snake',
      'plunger', 'electrician', 'handyman', 'cleaning supplies', 'laundry detergent',
      'tide pods', 'fabric softener', 'bounce dryer sheets', 'liquid bleach', 'all purpose cleaner',
      'disinfectant spray', 'lysol wipes', 'clorox wipes', 'glass cleaner', 'windex',
      'dish soap', 'dawn dish soap', 'dishwasher detergent', 'cascade pods', 'rinse aid',
      'floor cleaner', 'swiffer refills', 'mop and bucket', 'broom and dustpan', 'microfiber cloths',
      'scrub sponges', 'scouring pads', 'trash bags', 'garbage bags', 'recycling bags',
      'paper towels', 'bounty paper towels', 'toilet paper', 'charmin', 'facial tissues',
      'kleenex', 'air freshener', 'glade plug-in', 'bug spray', 'roach bait',
      'potting soil', 'plant pots', 'watering can', 'garden hose', 'estropajos scotch brite verde',
      'estropajo salvagunas azul', 'bayetas microfibra vileda', 'fregona vileda microfibra', 'cubo vileda easy wring pedal', 'escoba suave parquet',
      'recogedor con palo abatible', 'don limpio ph neutro', 'friegasuelos bioalcohol amoniacal', 'limpiahogar con lejia estrella', 'lejia con detergente conejo',
      'amoniaco perfumado volvone', 'limpiador desengrasante kh7', 'quita grasas cif crema', 'limpiador vitroceramica vitroclen', 'rascador de vitroceramica cuchillas',
      'pastillas lavavajillas finish quantum', 'somat pastillas lavavajillas', 'abrillantador lavavajillas finish', 'sal lavavajillas finish descalcificar', 'limpiamaquinas lavavajillas liquido',
      'detergente ariel pods todo en uno', 'detergente liquido skip active', 'detergente colon en polvo', 'suavizante concentrado mimosin azul', 'suavizante vernel celestial',
      'toallitas atrapacolor dr beckmann', 'percarbonato de sodio blanqueador', 'oxigeno activo vanish oxi action', 'limpiador antical viakal spray', 'pato wc disco activo',
      'gel wc desinfectante harpic', 'ambientador electrico air wick', 'pulverizador glade brise', 'spray cucarachas cucal', 'spray moscas y mosquitos raid',
      'trampas de hormigas raid', 'bolsas de basura autocierre 30l', 'bolsas de basura industriales 50l', 'bolsas basura organico compostables', 'papel higienico scottex acolchado',
      'papel de cocina colhogar gigante', 'servilletas renova dos capas', 'panuelos kleenex en caja', 'papel de aluminio albal 30m', 'film transparente albal corte facil',
      'papel vegetal para horno albal', 'bolsas congelacion zip albal', 'fiambreras hermeticas tefal', 'tuppers de cristal microondas horno', 'botella termica acero inoxidable',
      'termo de cafe takeaway', 'brocas de hormigon bosch', 'brocas para madera', 'brocas para metal hss', 'taco de lija grano medio',
      'papel de lija al agua', 'tacos fischer duopower', 'tornillos de madera pozi', 'tornillos autorroscantes chapa', 'alcayatas roscadas',
      'hembrillas abiertas', 'cancamos cerrados', 'cuelgafaciles para cuadros', 'tiras adhesivas tesa powerstrips', 'cinta americana tesa extra power',
      'cinta aislante pvc negra', 'cinta de teflon fontaneria', 'pattex barrita arreglatodo', 'adhesivo pattex no mas clavos', 'silicona antimoho banos quilosa',
      'silicona neutra transvalida', 'pistola de silicona cartucho', 'espuma de poliuretano spray', 'pasta lista aguaplast reparar', 'espatula de pintor inox',
      'llana para alisar masilla', 'pintura plastica blanca titan', 'brocha plana recortar bordes', 'rodillo antigota pelo corto', 'cubeta pintura rejilla escurridora',
      'plastico protector cubretodo pintar', 'cerrojo fac antibumping', 'bombin de seguridad cilindro europerfil', 'candado lince laton llave', 'llave inglesa ajustable bahco',
      'juego llaves fijas stanley', 'destornilladores de precision gafas', 'juego llaves allen hexagonales', 'alicates universales aislados 1000v', 'alicate punta fina doblada',
      'alicate pelacables automatico', 'cinta metrica stanley fatmax', 'nivel de burbuja magnetico', 'flexo de ducha extensible inox', 'alcachofa de ducha filtro antical',
      'cartucho monomando ceramico', 'latiguillos flexibles grifo lavabo', 'sifon extensible fregadero cocina', 'desatascador fuelle vater', 'desatascador liquido tuberias melt',
      'gel desatascador destop rapido', 'bombilla led e27 calida philips', 'bombilla led e14 vela noche', 'bombilla gu10 led regulable techo', 'regleta multienchufe proteccion',
      'alargador electrico 5 metros', 'enchufe schuko macho tierra', 'interruptor empotrable simon', 'enchufe empotrable simon', 'arreglos en casa',
      'chapuzas en casa', 'arreglar la casa', 'limpieza a fondo casa', 'pintar el piso', 'pintar la casa',
      'reparacion del grifo', 'cambiar bombilla', 'enchufe inteligente', 'bombilla inteligente', 'philips hue',
      'tira led', 'cable hdmi', 'cable de red ethernet', 'repetidor wifi', 'pila boton',
      'pilas aa', 'pilas aaa', 'pilas duracell', 'pilas energizer', 'bateria externa powerbank',
      'soporte tv pared', 'soporte movil coche', 'adaptador de corriente', 'ladron de enchufes', 'mando a distancia universal',
      'escobilla wc bano', 'cortina de bano ducha', 'alfombra de bano antideslizante', 'portarrollos bano', 'dosificador jabon bano',
      'tapon lavabo bano', 'desague ducha', 'mampara de ducha', 'limpiamamparas', 'antical de ducha',
      'pastilla desincrustante wc', 'bloque cisterna wc', 'pelador de patatas', 'abrelatas manual', 'sacacorchos vino',
      'abridor botellas', 'tabla de cortar cocina', 'tabla cortar bambu', 'cuchillo cocinero', 'cuchillo jamonero',
      'afilador de cuchillos', 'tijeras de cocina', 'escurridor de pasta', 'rallador de queso', 'batidor de varillas',
      'lengua de silicona reposteria', 'molde de bizcocho horno', 'balanza digital de cocina', 'bascula de cocina'
    ]
  },

  clothing_fashion: {
    categoryIds: ['cat-ropa'],
    categoryMatch: ['ropa', 'moda', 'calzado', 'clothes', 'clothing', 'fashion', 'apparel', 'zapato', 'vestimenta'],
    keywords: [
      'ropa', 'clothes', 'clothing', 'pantalones', 'pantalon',
      'vaqueros', 'jeans', 'levis', 'chinos', 'bermudas',
      'shorts', 'banador', 'bikini', 'camisa', 'shirt',
      'camiseta', 'tshirt', 't-shirt', 'polo', 'jersey',
      'sueter', 'sudadera', 'hoodie', 'chaqueta', 'jacket',
      'cazadora', 'cazadora vaquera', 'blazer', 'americana', 'traje',
      'abrigo', 'coat', 'plumifero', 'anorak', 'gabardina',
      'vestido', 'dress', 'falda', 'mono', 'pijama',
      'ropa interior', 'calzoncillos', 'boxers', 'bragas', 'sujetador',
      'calcetines', 'socks', 'medias', 'pantis', 'zapatos',
      'shoes', 'calzado', 'tacones', 'mocasines', 'zapatillas',
      'sneakers', 'deportivas', 'bambas', 'botas', 'botines',
      'botas chelsea', 'sandalias', 'chanclas', 'alpargatas', 'zapatillas casa',
      'cinturon', 'bolso', 'cartera', 'monedero', 'mochila',
      'gafas de sol', 'rayban', 'gorra', 'gorro lana', 'bufanda',
      'guantes', 'paraguas', 'joyas', 'joyeria', 'reloj pulsera',
      'pendientes', 'collar', 'pulsera', 'anillo', 'zara',
      'mango', 'h&m', 'pull&bear', 'pull and bear', 'stradivarius',
      'bershka', 'massimo dutti', 'oysho', 'primark', 'lefties',
      'shein', 'asos', 'zalando', 'el corte ingles moda', 'cortefiel',
      'springfield', 'women secret', 'intimissimi', 'calzedonia', 'uniqlo',
      'nike', 'adidas', 'puma', 'new balance', 'vans',
      'converse', 'calvin klein', 'tommy hilfiger', 'lacoste', 'bimba y lola',
      'parfois', 'tous', 'pandora', 'desigual', 'apparel',
      'wardrobe', 'pants', 'trousers', 'slacks', 'denim jeans',
      'skinny jeans', 'straight leg jeans', 'cargo pants', 'sweatpants', 'joggers',
      'leggings', 'biker shorts', 'bermuda shorts', 'denim shorts', 'swim trunks',
      'board shorts', 'swimsuit', 'one-piece swimsuit', 'collared shirt', 'button-down shirt',
      'dress shirt', 'flannel shirt', 'tee shirt', 'graphic tee', 'v-neck shirt',
      'polo shirt', 'crewneck sweater', 'knit sweater', 'cardigan', 'pullover hoodie',
      'zip-up hoodie', 'sweatshirt', 'denim jacket', 'leather jacket', 'bomber jacket',
      'trench coat', 'wool coat', 'puffer jacket', 'winter parka', 'windbreaker',
      'rain jacket', 'suit jacket', 'suit trousers', 'tuxedo', 'formal dress',
      'cocktail dress', 'maxi dress', 'sundress', 'midi skirt', 'mini skirt',
      'pleated skirt', 'romper', 'jumpsuit', 'pajama set', 'pajama pants',
      'nightgown', 'bathrobe', 'mens boxers', 'boxer briefs', 'briefs',
      'underwear', 'womens panties', 'thong', 'sports bra', 'push-up bra',
      'strapless bra', 'ankle socks', 'crew socks', 'wool socks', 'dress socks',
      'tights', 'sheer pantyhose', 'athletic shoes', 'running shoes', 'high tops',
      'dress shoes', 'oxford shoes', 'loafers', 'chelsea boots', 'ankle boots',
      'winter boots', 'combat boots', 'high heels', 'pumps', 'wedges',
      'ballet flats', 'sandals', 'slides', 'flip flops', 'house slippers',
      'leather belt', 'leather wallet', 'bifold wallet', 'card holder', 'crossbody bag',
      'shoulder bag', 'tote bag', 'handbag', 'clutch', 'backpack',
      'duffle bag', 'sunglasses', 'polarized sunglasses', 'baseball cap', 'knit beanie',
      'sun hat', 'fedora', 'winter scarf', 'leather gloves', 'winter gloves',
      'umbrella', 'wrist watch', 'gold earrings', 'silver necklace', 'pendant',
      'bracelet', 'ring', 'jewelry', 'ir de tiendas', 'comprar ropa',
      'compras de rebajas', 'comprarme unos vaqueros', 'pantalones vaqueros levis', 'camiseta basica zara', 'sudadera con capucha',
      'jersey de lana invierno', 'chaqueta de abrigo', 'cazadora de cuero', 'vestido para boda', 'falda plisada',
      'pijama de invierno', 'comprar calcetines', 'ropa interior calzoncillos', 'sujetador comodo', 'zapatillas deportivas bambas',
      'botas de invierno', 'sandalias de verano', 'chanclas para playa', 'cinturon de cuero', 'bolso de mano',
      'cartera monedero', 'clothes shopping mall', 'bought new jeans', 'bought sneakers shoes', 'bought a jacket coat',
      'bought workout clothes', 'underwear socks pack'
    ]
  },

  personal_care_beauty: {
    categoryIds: ['cat-personal'],
    categoryMatch: ['cuidado personal', 'peluquer', 'barber', 'belleza', 'estetica', 'personal care', 'beauty', 'hair'],
    keywords: [
      'peluqueria', 'peluquero', 'peluquera', 'corte de pelo', 'cortar pelo',
      'cortar puntas', 'peinado', 'tinte pelo', 'tinte y mechas', 'mechas',
      'mechas balayage', 'decoloracion', 'alisado keratina', 'haircut', 'salon',
      'barberia', 'barbero', 'corte caballero', 'arreglo barba', 'arreglo de barba',
      'recorte barba', 'afeitado', 'afeitado clasico', 'estetica', 'centro estetica',
      'limpieza facial', 'higiene facial', 'peeling', 'manicura', 'manicure',
      'manicura semipermanente', 'pedicura', 'pedicure', 'unas gel', 'unas acrilicas',
      'pintar unas', 'depilacion', 'cera depilatoria', 'depilacion laser', 'laser diodo',
      'depilacion cejas', 'cejas hilo', 'lifting pestanas', 'extensiones pestanas', 'masaje relajante',
      'drenaje linfatico', 'maderoterapia', 'spa', 'circuito spa', 'balneario',
      'champu', 'shampoo', 'mascarilla pelo', 'acondicionador', 'serum pelo',
      'gomina', 'cera pelo', 'gel ducha', 'jabon manos', 'desodorante',
      'roll-on', 'cuchillas afeitar', 'gillette', 'maquina afeitar', 'espuma afeitar',
      'after shave', 'crema facial', 'crema hidratante', 'contorno ojos', 'serum facial',
      'retinol', 'acido hialuronico crema', 'protector solar', 'crema solar', 'aftersun',
      'crema manos', 'cacao labios', 'balsamo labial', 'vaselina', 'toallitas desmaquillantes',
      'agua micelar', 'maquillaje', 'base maquillaje', 'corrector ojeras', 'rimel',
      'mascara pestanas', 'eyeliner', 'pintalabios', 'barra labios', 'brillo labios',
      'colorete', 'iluminador', 'esmalte unas', 'perfume', 'colonia',
      'eau de parfum', 'eau de toilette', 'perfumeria', 'primor', 'druni',
      'sephora', 'douglas', 'arenal', 'kiko milano', 'rituals',
      'the body shop', 'yves rocher', 'lush', 'mens haircut', 'womens haircut',
      'fade haircut', 'trim', 'hair coloring', 'hair highlights', 'hair bleaching',
      'balayage highlights', 'keratin treatment', 'blowout', 'hair wash and style', 'barbershop',
      'barber', 'beard trim', 'hot towel shave', 'straight razor shave', 'beard oil',
      'nail salon', 'gel manicure', 'acrylic nails', 'dip powder nails', 'nail fill',
      'spa pedicure', 'waxing', 'bikini wax', 'brazilian wax', 'eyebrow waxing',
      'eyebrow threading', 'eyebrow microblading', 'lash lift', 'eyelash extensions', 'facial treatment',
      'deep cleansing facial', 'chemical peel', 'microdermabrasion', 'massage therapy', 'deep tissue massage',
      'swedish massage', 'couples massage', 'day spa', 'steam room', 'sauna pass',
      'dandruff shampoo', 'hair conditioner', 'leave-in conditioner', 'hair mask', 'hair serum',
      'argan oil', 'styling gel', 'hair pomade', 'hair wax', 'hairspray',
      'dry shampoo', 'body wash', 'shower gel', 'bar soap', 'liquid hand soap',
      'hand sanitizer', 'deodorant stick', 'antiperspirant spray', 'safety razor', 'disposable razors',
      'razor blade refills', 'shaving cream', 'shaving gel', 'aftershave lotion', 'facial cleanser',
      'foaming cleanser', 'micellar water', 'facial toner', 'hyaluronic acid serum', 'vitamin c serum',
      'retinol serum', 'face moisturizer', 'daily face lotion', 'night cream', 'eye cream',
      'sunscreen lotion', 'face sunscreen', 'spf 50', 'after sun lotion', 'aloe vera gel',
      'lip balm', 'chapstick', 'aquaphor', 'body lotion', 'hand cream',
      'exfoliating body scrub', 'makeup foundation', 'liquid concealer', 'pressed powder', 'bronzer',
      'powder blush', 'highlighter', 'eyeshadow palette', 'waterproof mascara', 'liquid eyeliner',
      'eyebrow pencil', 'matte lipstick', 'lip gloss', 'lip liner', 'makeup setting spray',
      'makeup remover wipes', 'cotton rounds', 'nail polish', 'nail polish remover', 'cologne',
      'body mist', 'scented lotion', 'ir a la pelu', 'ir a la peluqueria', 'cortarme el pelo',
      'corte de pelo mujer', 'corte de pelo hombre', 'tinte y mechas balayage', 'retocarme las raices', 'hacerme las unas',
      'unas de gel manicura', 'hacerme la pedicura', 'depilacion de cejas hilo', 'depilarme las piernas', 'sesion de depilacion laser',
      'limpieza de cutis facial', 'hacerme un facial', 'masaje descontracturante', 'comprar champu', 'mascarilla para el pelo',
      'crema hidratante facial', 'protector solar cara spf50', 'comprar maquillaje', 'comprar colonia perfume', 'arreglo de barba barbero',
      'afeitado en barberia', 'haircut salon appointment', 'got my hair done', 'got my nails done', 'acrylic nails set',
      'pedicure spa visit', 'eyebrow threading salon', 'laser hair removal session', 'massage appointment spa', 'bought skincare moisturizer',
      'facial sunscreen lotion', 'loreal', 'garnier', 'pantene', 'head & shoulders',
      'head and shoulders', 'tresemme', 'ogx', 'kerastase', 'olaplex',
      'moroccanoil', 'batiste champu seco', 'nivea crema lata azul', 'dove gel', 'sanex gel',
      'moussel', 'la roche posay', 'cerave limpiador', 'bioderma agua micelar', 'avene agua termal',
      'eucerin ph5', 'isdin fotoprotector', 'heliocare 360', 'vichy mineral 89', 'sesderma c-vit',
      'the ordinary serum', 'paulas choice', 'neutrogena hydro boost', 'clinique crema', 'estee lauder',
      'lancome', 'clarins', 'mac cosmetics', 'maybelline corrector', 'nyx maquillaje',
      'essence maquillaje', 'catrice corrector', 'toallitas intimas', 'discos desmaquillantes algodon', 'bastoncillos para los oidos',
      'algodon hidrofilo', 'cortaunas manicura', 'tijeras de unas', 'lima de unas manicura', 'pinzas de depilar cejas',
      'espejo de aumento bano', 'secador de pelo difusor', 'planchas de pelo ghd', 'cepillo de pelo tangle teezer'
    ]
  },

  travel_vacations: {
    categoryIds: ['cat-viajes'],
    categoryMatch: ['viaje', 'vacacion', 'hotel', 'travel', 'holiday', 'trip', 'escapada', 'alojamiento'],
    keywords: [
      'vuelo', 'vuelos', 'flight', 'flights', 'billete avion',
      'billetes avion', 'tarjeta embarque', 'maleta facturada', 'equipaje cabina', 'ryanair',
      'vueling', 'iberia', 'iberia express', 'air europa', 'easyjet',
      'lufthansa', 'air france', 'klm', 'wizz air', 'volotea',
      'norwegian', 'binter', 'emirates', 'skyscanner', 'kayak',
      'edreams', 'hotel', 'hoteles', 'hostal', 'pension',
      'albergue', 'hostel', 'resort', 'parador', 'casa rural',
      'turismo rural', 'apartamento vacaciones', 'airbnb', 'booking', 'booking.com',
      'expedia', 'trivago', 'tasa turistica', 'city tax', 'camping',
      'bungalow', 'crucero', 'ferry', 'balearia', 'trasmediterranea',
      'alquiler coche', 'car rental', 'coche alquiler', 'sixt', 'europcar',
      'avis', 'hertz', 'goldcar', 'centauro', 'record go',
      'ok mobility', 'seguro viaje', 'seguro cancelacion', 'iati seguros', 'heymondo',
      'pasaporte', 'renovacion pasaporte', 'visado', 'esta usa', 'guia turistica',
      'free tour', 'excursion', 'maleta viaje', 'trolley', 'samsonite',
      'almohada viaje', 'adaptador enchufe', 'escapada', 'roundtrip flight', 'one way flight',
      'domestic flight', 'international flight', 'airline tickets', 'checked luggage fee', 'carry on baggage fee',
      'seat selection fee', 'delta airlines', 'united airlines', 'american airlines', 'southwest airlines',
      'jetblue', 'alaska airlines', 'spirit airlines', 'frontier airlines', 'british airways flight',
      'lufthansa flight', 'air canada', 'hotel reservation', 'boutique hotel stay', 'luxury resort stay',
      'all inclusive resort', 'motel room', 'youth hostel bunk', 'vacation rental home', 'airbnb booking fee',
      'vrbo rental', 'bed and breakfast', 'hotel cleaning fee', 'resort fee', 'room service charge',
      'mini bar bill', 'airport hotel shuttle', 'car rental agency', 'enterprise rent-a-car', 'hertz car rental',
      'budget car rental', 'alamo rent-a-car', 'national car rental', 'rental car insurance collision waiver', 'international driving permit',
      'tourist visa fee', 'us passport renewal fee', 'expedited passport', 'global entry application', 'tsa precheck fee',
      'travel health insurance policy', 'trip cancellation insurance', 'city walking tour', 'hop-on hop-off bus', 'museum fast pass ticket',
      'cathedral tower entrance', 'boat cruise tour', 'snorkeling excursion', 'scuba diving trip', 'hardside suitcase set',
      'carry on trolley bag', 'packing cubes set', 'tsa luggage lock', 'memory foam travel pillow', 'universal travel power adapter',
      'camping tent 4-person', 'sleeping bag 20 degree', 'inflatable sleeping pad', 'camping stove propane', 'transmediterranea ferry',
      'balearia billete barco', 'naviera armas', 'fred olsen', 'alquiler de camper furgoneta', 'alquiler de autocaravana',
      'area de autocaravanas', 'bungalow de camping', 'glamping tienda', 'seguro de viaje internacional', 'cambio de divisas moneda',
      'comision de cajero extranjero', 'tarjeta revolut', 'guia lonely planet', 'mapa turistico', 'audioguia de museo',
      'alquiler de sombrilla playa', 'hamaca de playa alquiler'
    ]
  },

  sports_fitness: {
    categoryIds: ['cat-deporte'],
    categoryMatch: ['deporte', 'gimnasio', 'fitness', 'sport', 'gym', 'entrenamiento'],
    keywords: [
      'gimnasio', 'gym', 'cuota gym', 'cuota gimnasio', 'matricula gym',
      'mensualidad gym', 'basic fit', 'basic-fit', 'mcfit', 'altafit',
      'vivagym', 'go fit', 'gofit', 'anytime fitness', 'planet fitness',
      'dreamfit', 'fitness park', 'metropolitan', 'virgin active', 'forus',
      'brooklyn fitboxing', 'crossfit', 'cuota crossfit', 'box crossfit', 'entrenador personal',
      'yoga', 'clases yoga', 'yoga mat', 'esterilla yoga', 'pilates',
      'clases pilates', 'spinning', 'ciclo indoor', 'zumba', 'body pump',
      'natacion', 'abono piscina', 'piscina climatizada', 'banador natacion', 'gorro natacion',
      'gafas natacion', 'boxeo', 'guantes boxeo', 'vendas boxeo', 'artes marciales',
      'escalada', 'rocodromo', 'pies de gato', 'padel', 'partido padel',
      'partido de padel', 'alquiler padel', 'pista padel', 'pelotas padel', 'pala padel',
      'paletero', 'tenis', 'clases tenis', 'raqueta tenis', 'futbol',
      'partido futbol', 'botas futbol', 'balon futbol', 'baloncesto', 'balon basket',
      'running', 'zapatillas running', 'zapatillas correr', 'pulsometro', 'reloj garmin',
      'strava', 'dorsal carrera', 'media maraton', 'maraton', 'bicicleta',
      'casco bici', 'culotte', 'suplementacion', 'proteina', 'proteina whey',
      'proteina aislada', 'creatina', 'creatina monohidrato', 'bcaa', 'preentreno',
      'barritas proteina', 'shaker', 'mancuernas', 'pesas', 'kettlebell',
      'bandas elasticas', 'comba', 'mallas', 'decathlon', 'sprinter',
      'jd sports', 'prozis', 'myprotein', 'gym membership fee', 'monthly gym dues',
      'gym initiation fee', 'fitness club', 'ymca membership', '24 hour fitness', 'planet fitness black card',
      'equinox gym', 'la fitness', 'gold gym', 'crossfit membership', 'unlimited crossfit',
      'wod drop-in', 'personal trainer sessions', 'strength training coach', 'hiit class pass', 'bootcamp fitness',
      'spin class package', 'soulcycle class', 'peloton all-access', 'hot yoga class', 'vinyasa yoga',
      'pilates reformer class', 'solidcore class', 'pure barre class', 'zumba class', 'swimming pool lap pass',
      'aquatic center pass', 'swim goggles', 'silicone swim cap', 'kickboard', 'boxing gym',
      'kickboxing classes', 'muay thai classes', 'jiu jitsu academy', 'bjj gi', 'martial arts uniform',
      'rock climbing gym day pass', 'climbing harness', 'chalk bag', 'climbing shoes', 'tennis court rental',
      'indoor tennis lessons', 'tennis racket stringing', 'tennis balls can', 'padel court booking', 'padel racket',
      'squash court fee', 'golf green fee', 'golf cart rental', 'driving range bucket', 'golf balls pack',
      'soccer league fee', 'adult soccer cleats', 'shin guards', 'basketball court fee', 'marathon registration',
      'half marathon entry', '5k race entry', 'running shoes road', 'trail running shoes', 'hydration vest',
      'running belt', 'gps running watch', 'garmin watch', 'heart rate monitor chest strap', 'road bike tune-up',
      'bicycle helmet', 'padded bike shorts', 'cycling jersey', 'whey protein isolate', 'plant protein powder',
      'creatine monohydrate powder', 'bcaa powder', 'pre-workout powder', 'electrolyte powder packets', 'protein meal bar',
      'energy gels pack', 'metal shaker bottle', 'blender bottle', 'adjustable dumbbells set', 'cast iron kettlebell',
      'rubber resistance bands', 'speed jump rope', 'foam roller', 'massage gun', 'lacrosse ball',
      'partidito de padel', 'pista de padel reserva', 'bote de bolas padel', 'cambiar overgrip pala padel', 'partido de futbol sala',
      'futbol 7 pachanga', 'alquiler de pista deportiva', 'cuota del gimnasio', 'pagar el gym', 'mensualidad del gym',
      'clase de yoga esterilla', 'clase de pilates maquina', 'clase de spinning ciclo', 'clases de boxeo guantes', 'escalada en rocodromo',
      'abono de piscina municipal', 'bañador de natacion piscina', 'gafas de nadar speedo', 'gorro de silicona natacion', 'zapatillas de correr running',
      'plantillas running', 'mallas de deporte decathlon', 'camiseta termica deporte', 'suplemento proteina whey', 'bote de creatina monohidrato',
      'barritas energeticas deporte', 'geles de maraton', 'mancuernas de gimnasio', 'pesas para casa', 'bandas elasticas fitness',
      'comba de crossfit', 'gym fee dues', 'monthly gym pass', 'crossfit drop in class', 'yoga studio pass',
      'pilates reformer fee', 'swim lap pool pass', 'tennis court booking', 'pickleball court fee', 'running sneakers pair',
      'protein powder tub', 'creatine supplement powder', 'workout dumbbells set', 'senderismo', 'trekking',
      'bastones de trekking', 'botas de montana', 'salomon', 'the north face', 'columbia',
      'mochila de montana', 'cantimplora de monte', 'tienda de campana', 'saco de dormir', 'forro polar',
      'chaqueta cortavientos', 'esqui', 'snowboard', 'forfait esqui', 'alquiler de esquies',
      'gafas de ventisca', 'casco de esqui', 'patinaje sobre hielo', 'patines en linea', 'skate monopatin',
      'surf tabla', 'neopreno de surf', 'clases de surf', 'bodyboard', 'kitesurf',
      'submarinismo buceo', 'snorkel', 'aletas de buceo', 'gafas de buceo', 'kayak alquiler',
      'paddle surf sup'
    ]
  },

  children_education: {
    categoryIds: ['cat-educacion'],
    categoryMatch: ['educacion', 'colegio', 'ninos', 'hijos', 'escuela', 'education', 'kids', 'baby', 'bebe'],
    keywords: [
      'daycare', 'childcare', 'preschool', 'kindergarten', 'nursery',
      'tuition', 'school tuition', 'college tuition', 'university tuition', 'school',
      'school supplies', 'textbook', 'textbooks', 'tutor', 'tutoring',
      'nanny', 'babysitter', 'diapers', 'baby wipes', 'baby formula',
      'baby food', 'stroller', 'crib', 'car seat', 'bebe',
      'baby', 'panales', 'dodot', 'dodot sensitive', 'toallitas bebe',
      'toallitas dodot', 'crema panal', 'mustela', 'champu bebe', 'colonia bebe',
      'nenuco', 'chupete', 'chupetes', 'mordedor', 'biberon',
      'biberones', 'sacaleches', 'leche formula', 'leche de formula', 'leche iniciacion',
      'nan', 'almiron', 'blemil', 'nidina', 'potitos',
      'papillas bebe', 'cuna', 'colchon cuna', 'sabanas cuna', 'cambiador bebe',
      'banera bebe', 'trona', 'carrito bebe', 'cochecito bebe', 'silla de paseo',
      'silla paseo', 'bugaboo', 'jane', 'cybex', 'silla coche bebe',
      'isofix', 'maxicosi', 'portabebes', 'guarderia', 'escuela infantil',
      'colegio', 'cuota colegio', 'mensualidad cole', 'matricula colegio', 'ruta escolar',
      'comedor escolar', 'uniforme escolar', 'babi cole', 'libros texto', 'libros de texto',
      'cheque libro', 'material escolar', 'mochila cole', 'libreta', 'cuaderno',
      'estuche', 'lapices', 'rotuladores', 'libros', 'libreria',
      'casa del libro', 'academia ingles', 'academia idiomas', 'clases particulares', 'profesor particular',
      'autoescuela', 'matricula autoescuela', 'clases practicas coche', 'matricula universidad', 'tasas universitarias',
      'master', 'curso online', 'udemy', 'coursera', 'platzi',
      'extraescolares', 'campamento verano', 'ropa bebe', 'body bebe', 'bodies',
      'pelele', 'biomecanics', 'pablosky', 'juguetes', 'lego',
      'playmobil', 'muñecas', 'peluches', 'puzzle', 'ninera',
      'canguro', 'infant diapers size 1', 'diapers size 2', 'diapers size 3', 'diapers size 4',
      'diapers size 5', 'pull-ups training pants', 'fragrance free baby wipes', 'water wipes pack', 'diaper rash cream',
      'desitin ointment', 'aquaphor baby', 'baby shampoo and body wash', 'baby lotion Aveeno', 'silicone pacifiers',
      'pacifier clip', 'teething toy', 'anti-colic baby bottles', 'dr brown bottles', 'bottle nipples replacement',
      'electric breast pump', 'breast milk storage bags', 'nursing pads disposable', 'infant formula powder', 'similac baby formula',
      'enfamil infant formula', 'organic baby food pouches', 'baby rice cereal', 'wooden baby crib', 'breathable crib mattress',
      'cotton crib sheets', 'changing table pad', 'baby bath tub', 'ergonomic high chair', 'modular baby stroller',
      'umbrella stroller', 'infant car seat', 'convertible car seat', 'booster car seat', 'mesh baby carrier',
      'ergo baby wrap', 'childcare center tuition', 'daycare monthly fee', 'infant daycare', 'preschool tuition',
      'after school program', 'summer day camp tuition', 'sleepaway camp fee', 'private school tuition', 'school registration fee',
      'elementary textbooks', 'high school lab fee', 'spiral notebooks college ruled', 'three ring binder', 'filler paper pack',
      'pencil case pouch', 'graphing calculator ti-84', 'wooden pencils #2', 'gel pens pack', 'colored markers set',
      'crayola crayons 64 pack', 'school lunch account deposit', 'math tutor hourly rate', 'sat prep course', 'act prep class',
      'college application fees', 'university dorm deposit', 'drivers education course', 'driving lesson hours', 'baby onesies pack',
      'footie pajamas baby', 'toddler sneakers', 'kids winter coat', 'building blocks set', 'lego classic bricks',
      'action figures', 'stuffed animals', 'board game for kids', 'babysitter cash payment', 'nanny weekly rate',
      'panales dodot bebe', 'toallitas humedas bebe', 'leche de iniciacion formula', 'biberones anticolic', 'chupetes de silicona',
      'papilla de cereales bebe', 'potitos de fruta verdura', 'cuna de bebe colchon', 'carrito de bebe paseo', 'silla de coche grupo 1 2 3',
      'mensualidad de la guarderia', 'cuota del colegio concertado', 'comedor escolar mensual', 'ruta del autobus del cole', 'uniforme escolar nino',
      'libros de texto cheque libro', 'material escolar lapices cuadernos', 'mochila escolar con ruedas', 'academia de ingles ninos', 'clases particulares matematicas',
      'pagar a la canguro ninera', 'campamento de verano ninos', 'baby diapers wipes pack', 'infant formula baby milk', 'baby bottles nipples',
      'stroller car seat combo', 'daycare tuition payment', 'preschool monthly tuition', 'school supplies notebooks', 'libros de lectura infantil',
      'cuentos infantiles ninos', 'plastilina play-doh', 'pinturas de dedos', 'rotuladores carioca', 'lapices alpino caja',
      'goma de borrar milan', 'sacapuntas con deposito', 'regla milimetrada escolar', 'compas escolar dibujo', 'tijeras de punta roma',
      'pegamento de barra pritt', 'cartulinas de colores escolar', 'papel charol manualidades', 'goma eva manualidades', 'archivador de anillas escolar',
      'fundas de plastico folio', 'separadores de archivador', 'notas adhesivas post-it', 'subrayadores stabilo boss', 'tipp-ex cinta correctora',
      'boligrafos bic cristal azul', 'pilot g2 de gel', 'estuche escolar triple', 'mochila escolar totto', 'cantimplora infantil colegio',
      'fiambrera escolar ninos'
    ]
  },

  insurance_taxes: {
    categoryIds: ['cat-seguros'],
    categoryMatch: ['seguro', 'impuesto', 'gestor', 'tasa', 'insur', 'tax', 'hacienda', 'legal'],
    keywords: [
      'insurance', 'car insurance', 'auto insurance', 'home insurance', 'life insurance',
      'health insurance', 'renters insurance', 'pet insurance', 'travel insurance', 'insurance policy',
      'insurance premium', 'geico', 'progressive', 'state farm', 'allstate',
      'taxes', 'property tax', 'income tax', 'vehicle tax', 'tax return',
      'tax payment', 'cpa', 'accountant', 'notary', 'lawyer',
      'attorney', 'legal fees', 'seguro', 'seguros', 'poliza seguro',
      'prima seguro', 'recibo seguro', 'seguro coche', 'seguro auto', 'seguro moto',
      'seguro hogar', 'seguro vivienda', 'seguro vida', 'seguro decesos', 'seguro mascotas',
      'seguro impago alquiler', 'mapfre', 'mutua madrilena', 'linea directa', 'allianz',
      'axa', 'generali', 'reale', 'ocaso', 'santa lucia',
      'caser', 'zurich', 'pelayo', 'qualitas auto', 'verti',
      'impuesto', 'impuestos', 'tasa', 'tasas', 'contribucion',
      'ibi', 'impuesto bienes inmuebles', 'recibo ibi', 'ivtm', 'impuesto circulacion',
      'impuesto vehiculos', 'tasa basuras', 'impuesto basuras', 'vado', 'tasa vado',
      'plusvalia', 'plusvalia municipal', 'itp', 'transmisiones patrimoniales', 'declaracion renta',
      'borrador renta', 'cita renta', 'pago renta', 'hacienda', 'aeat',
      'irpf', 'retenciones irpf', 'pago iva', 'modelo 303', 'modelo 130',
      'tasa 790', 'gestoria', 'gestor', 'asesor fiscal', 'asesoria',
      'cuota gestor', 'notario', 'notaria', 'gastos notaria', 'aranceles notariales',
      'escritura notarial', 'registro propiedad', 'nota simple', 'tasacion vivienda', 'abogado',
      'honorarios abogado', 'consulta legal', 'procurador', 'comprehensive car insurance', 'collision car insurance',
      'liability auto insurance', 'state farm insurance', 'geico auto insurance', 'progressive car insurance', 'allstate insurance',
      'usaa insurance', 'homeowners insurance policy', 'renters insurance policy', 'term life insurance premium', 'whole life insurance policy',
      'disability insurance premium', 'umbrella insurance policy', 'flood insurance policy', 'earthquake insurance policy', 'county property tax bill',
      'school district property tax', 'municipal real estate tax', 'annual vehicle registration fee', 'car tag renewal fee', 'license plate renewal',
      'city trash collection fee', 'water and sewer municipal tax', 'federal income tax payment', 'irs tax bill', 'state income tax payment',
      'quarterly estimated tax payment', '1040 tax preparation fee', 'cpa tax filing charge', 'turbo tax software', 'h&r block filing fee',
      'certified public accountant hourly', 'bookkeeper monthly retainer', 'estate planning lawyer', 'will and trust attorney', 'power of attorney drafting',
      'real estate closing attorney', 'title search fee', 'title insurance premium', 'notary public acknowledgment fee', 'notary stamp service',
      'mobile notary travel fee', 'court filing fee', 'probate court fees', 'traffic ticket fine', 'speeding ticket payment',
      'recibo del seguro del coche', 'poliza de seguro de moto', 'seguro de hogar vivienda', 'seguro de vida hipoteca', 'seguro de decesos prima',
      'recibo del ibi ayuntamiento', 'impuesto sobre bienes inmuebles', 'impuesto de vehiculos ivtm', 'tasa de vado permanente', 'tasa municipal de basuras',
      'pago declaracion de la renta', 'borrador de la renta aeat', 'pago de iva trimestral autonomos', 'cuota mensual de la gestoria', 'gastos de notario escritura',
      'honorarios del abogado consulta', 'auto insurance policy renewal', 'homeowners insurance premium', 'property tax county bill', 'irs tax bill payment',
      'quarterly estimated taxes', 'accountant cpa tax prep', 'notary signing fee'
    ]
  },

  housing_mortgage: {
    categoryIds: ['cat-1'],
    categoryMatch: ['alquiler', 'hipoteca', 'vivienda', 'rent', 'mortgage', 'housing'],
    keywords: [
      'rent', 'monthly rent', 'apartment rent', 'house rent', 'mortgage',
      'mortgage payment', 'home loan', 'security deposit', 'lease', 'alquiler',
      'mensualidad alquiler', 'pago alquiler', 'renta piso', 'arrendamiento', 'fianza alquiler',
      'mes fianza', 'inmobiliaria', 'comision inmobiliaria', 'honorarios agencia', 'idealista',
      'fotocasa', 'hipoteca', 'cuota hipoteca', 'recibo hipoteca', 'pago hipoteca',
      'prestamo hipotecario', 'intereses hipoteca', 'amortizacion hipoteca', 'amortizacion anticipada', 'cancelacion hipoteca',
      'euribor hipoteca', 'cuota prestamo', 'monthly apartment rent', 'studio rent payment', 'house rent payment',
      'rent check payment', 'landlord rent wire', 'first month rent deposit', 'security deposit refund', 'pet deposit apartment',
      'rental application fee', 'apartment credit check fee', 'lease renewal fee', 'residential mortgage payment', '30 year fixed mortgage',
      '15 year fixed mortgage', 'monthly home loan payment', 'fha loan monthly payment', 'va loan mortgage payment', 'mortgage escrow payment',
      'principal and interest payment', 'private mortgage insurance pmi', 'extra mortgage principal payment', 'mortgage payoff wire', 'home equity line of credit heloc',
      'second mortgage payment', 'condo board monthly dues', 'pago mensual del alquiler', 'alquiler del piso mensual', 'transferencia del alquiler',
      'fianza del alquiler piso', 'cuota de la hipoteca banco', 'recibo mensual de la hipoteca', 'amortizacion de la hipoteca', 'comision de la inmobiliaria piso',
      'monthly apartment rent wire', 'house rent check payment', 'security deposit apartment', 'monthly mortgage loan payment'
    ]
  },

  savings_investment: {
    categoryIds: ['cat-7'],
    categoryMatch: ['ahorro', 'bote', 'fondo', 'hucha', 'savings', 'inversion', 'invest', 'patrimonio', 'imprevistos'],
    keywords: [
      'savings', 'emergency fund', 'investment', 'invest', 'stocks',
      'etf', 'mutual fund', 'index fund', 'hysa', 'high yield savings',
      'crypto', 'bitcoin', 'ahorro', 'bote ahorro', 'hucha compartida',
      'hucha comun', 'fondo ahorro', 'fondo comun', 'hucha', 'bote vacaciones',
      'hucha coche', 'bote boda', 'fondo emergencia', 'colchon seguridad', 'traspaso ahorro',
      'transferencia ahorro', 'aportacion periodica', 'piggy bank', 'revolut vault', 'n26 spaces',
      'bbva metas', 'hucha santander', 'cuenta naranja', 'inversion', 'aportacion fondos',
      'fondo indexado', 'plan pensiones', 'cuenta remunerada', 'deposito plazo fijo', 'letras del tesoro',
      'bonos estado', 'sp500', 'msci world', 'indexa capital', 'myinvestor',
      'trade republic', 'scalable capital', 'degiro', 'interactive brokers', 'xtb',
      'emergency savings deposit', 'rainy day fund transfer', 'monthly savings goal', 'automatic savings transfer', 'high yield savings account deposit',
      'marcus by goldman sachs savings', 'ally bank savings deposit', 'capital one 360 savings', 'certificate of deposit cd deposit', 'treasury direct t-bills',
      'us treasury bond purchase', 'vanguard index fund purchase', 'vanguard vtsax', 'fidelity s&p 500 fxaix', 'schwab index fund swppx',
      'voo etf purchase', 'vti total stock market', 'qqq nasdaq etf', 'monthly 401k contribution', 'traditional ira deposit',
      'roth ira annual contribution', 'sep ira deposit', 'health savings account hsa deposit', '529 college savings plan transfer', 'robinhood account deposit',
      'charles schwab brokerage transfer', 'fidelity investments brokerage', 'e-trade brokerage deposit', 'interactive brokers wire', 'webull brokerage deposit',
      'coinbase account deposit', 'meter en la hucha comun', 'transferencia a la hucha', 'apartar para el ahorro', 'ahorro para las vacaciones',
      'fondo de emergencia colchon', 'aportacion periodica fondo indexado', 'ingreso en cuenta remunerada', 'compra de letras del tesoro', 'emergency fund transfer',
      'monthly savings deposit', 'index fund automatic investment', 'high yield savings transfer'
    ]
  },

  gifts_donations: {
    categoryIds: ['cat-6', 'cat-8'],
    categoryMatch: ['regalo', 'donacion', 'ong', 'gift', 'donation', 'eventos', 'cumpleanos', 'otros'],
    keywords: [
      'gift', 'present', 'birthday gift', 'wedding gift', 'anniversary gift',
      'flowers', 'bouquet', 'donation', 'charity', 'tip',
      'tips', 'gratuity', 'regalo', 'regalo cumpleanos', 'regalo reyes',
      'regalo navidad', 'amigo invisible', 'regalo aniversario', 'regalo san valentin', 'regalo dia madre',
      'regalo dia padre', 'regalo boda', 'sobre boda', 'sobre dinero boda', 'papel regalo',
      'tarjeta felicitacion', 'caja sorpresa', 'flores', 'ramo flores', 'ramo de flores',
      'floristeria', 'rosas', 'bombones', 'caja bombones', 'cesta navidad',
      'colvin', 'interflora', 'donacion', 'ong', 'cuota ong',
      'socio ong', 'cruz roja', 'medicos sin fronteras', 'unicef', 'caritas',
      'greenpeace', 'aecc', 'save the children', 'banco de alimentos', 'crowdfunding',
      'gofundme', 'propina', 'birthday present', 'baby shower gift', 'bridal shower gift',
      'wedding registry gift', 'anniversary present', 'valentine gift', 'mothers day present', 'fathers day present',
      'christmas present', 'hanukkah gift', 'holiday gift basket', 'secret santa gift', 'white elephant gift',
      'graduation gift check', 'housewarming present', 'fresh flower bouquet delivery', 'dozen red roses', 'edible arrangements fruit',
      'godiva chocolate box', 'amazon gift card', 'target gift card', 'visa gift card', 'decorative gift wrap paper',
      'satin gift ribbon', 'personalized greeting card', 'charitable donation tax deductible', 'red cross disaster relief donation', 'salvation army donation',
      'st jude hospital donation', 'doctors without borders donation', 'local animal shelter donation', 'humane society donation', 'food bank cash donation',
      'kickstarter campaign pledge', 'gofundme memorial donation', 'restaurant tip cash', 'food delivery driver tip', 'valet tip cash',
      'hotel bellhop tip', 'regalo de cumpleanos amigo', 'regalo de reyes magos', 'regalo de navidad papa noel', 'regalo de amigo invisible',
      'regalo de aniversario pareja', 'regalo para la boda sobre', 'comprar un ramo de flores', 'flores para regalo', 'caja de bombones regalo',
      'donacion a la cruz roja', 'cuota mensual de ong', 'propina en el restaurante', 'birthday gift present', 'christmas holiday gift',
      'wedding registry present', 'flower bouquet delivery', 'charity donation receipt', 'dinner tip cash'
    ]
  }
};

export function findBestCategoryMatch(text: string, categories: Category[]): CategoryMatchResult | null {
  if (!text || categories.length === 0) return null;
  const textNorm = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // 1. Check vocabulary keywords with strict word-boundary matching
  for (const [_, vocab] of Object.entries(CATEGORY_VOCABULARY)) {
    const hasKeywordMatch = vocab.keywords.some((kw) => {
      const normKw = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const regex = new RegExp(`\\b${normKw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      return regex.test(textNorm);
    });

    if (hasKeywordMatch) {
      // Priority 1: Match by categoryIds if available in database
      if (vocab.categoryIds && vocab.categoryIds.length > 0) {
        const targetById = categories.find((c) => vocab.categoryIds.includes(c.id));
        if (targetById) {
          return {
            categoryId: targetById.id,
            categoryName: targetById.name,
            confidence: 0.99,
          };
        }
      }

      // Priority 2: Match by categoryMatch root words
      const targetByName = categories.find((c) => {
        const cName = c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return vocab.categoryMatch.some((pattern) => {
          const normPattern = pattern.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const patternRegex = new RegExp(`\\b${normPattern.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'i');
          return patternRegex.test(cName);
        });
      });

      if (targetByName) {
        return {
          categoryId: targetByName.id,
          categoryName: targetByName.name,
          confidence: 0.98,
        };
      }
    }
  }

  // 2. Direct category name matching fallback
  for (const cat of categories) {
    const cName = cat.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const catRegex = new RegExp(`\\b${cName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (catRegex.test(textNorm) || textNorm.includes(cName)) {
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        confidence: 0.85,
      };
    }
  }

  return null;
}

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
    const numStr = startMatch[2].replace(',', '.');
    amount = parseFloat(numStr);
    remainingText = text.slice(startMatch[0].length).trim();
  } else {
    const endAmountRegex = /\s+(\$|€|£)?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:€|\$|£|eur|euros|usd|gbp)?$/i;
    const endMatch = text.match(endAmountRegex);
    if (endMatch) {
      const numStr = endMatch[2].replace(',', '.');
      amount = parseFloat(numStr);
      remainingText = text.slice(0, endMatch.index).trim();
    }
  }

  if (amount === null || isNaN(amount) || amount <= 0) {
    return null;
  }

  let paidBy: BotParsedExpense['paidBy'] = 'common';
  let splitModeOverride: BotParsedExpense['splitModeOverride'] = null;

  const is5050 = /\b(50\/50|50-50|50 50|mitad|a medias|a partes iguales|equal|half|half and half)\b/i.test(remainingText);
  if (is5050) {
    splitModeOverride = 'equal';
    remainingText = remainingText.replace(/\b(50\/50|50-50|50 50|mitad|a medias|a partes iguales|equal|half|half and half)\b/gi, '').trim();
  }

  const p1Name = settings.partner1Name || 'Tú';
  const p2Name = settings.partner2Name || 'Pareja';

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const safeP1Name = escapeRegExp(p1Name);
  const safeP2Name = escapeRegExp(p2Name);

  const isExplicitCommon = /\b(comun|común|cuenta comun|cuenta común|casa|conjunto|joint|common|household|shared)\b/i.test(remainingText);
  const isP1Mention = new RegExp(`\\b(${safeP1Name}|yo|mio|mío|me|i paid|paid by ${safeP1Name})\\b`, 'i').test(remainingText);
  const isP2Mention = new RegExp(`\\b(${safeP2Name}|ella|él|suyo|suya|paid by ${safeP2Name})\\b`, 'i').test(remainingText);
  const isAdvanceWord = /\b(adelanto|adelante|adelanté|pague|pagué|pago yo|pagó|anticipo|out of pocket|pocket advance|advance)\b/i.test(remainingText);

  if (isExplicitCommon) {
    paidBy = 'common';
    remainingText = remainingText.replace(/\b(comun|común|cuenta comun|cuenta común|casa|conjunto|joint|common|household|shared)\b/gi, '').trim();
  } else if (isP1Mention) {
    paidBy = 'partner1';
    remainingText = remainingText.replace(new RegExp(`\\b(${safeP1Name}|yo|mio|mío|me|i paid|paid by ${safeP1Name})\\b`, 'gi'), '').trim();
  } else if (isP2Mention) {
    paidBy = 'partner2';
    remainingText = remainingText.replace(new RegExp(`\\b(${safeP2Name}|ella|él|suyo|suya|paid by ${safeP2Name})\\b`, 'gi'), '').trim();
  } else if (isAdvanceWord) {
    remainingText = remainingText.replace(/\b(adelanto|adelante|adelanté|pague|pagué|pago yo|pagó|anticipo|out of pocket|pocket advance|advance)\b/gi, '').trim();
    if (senderNameOrPhone) {
      const senderNorm = senderNameOrPhone.toLowerCase();
      if (senderNorm.includes(p1Name.toLowerCase())) {
        paidBy = 'partner1';
      } else if (senderNorm.includes(p2Name.toLowerCase())) {
        paidBy = 'partner2';
      } else {
        paidBy = 'partner1';
      }
    } else {
      paidBy = 'partner1';
    }
  }

  let cleanTitle = remainingText
    .replace(/^(he comprado|he pagado|he pillado|he sacado|compré|compre|comprado|compramos|pagamos|pagué|pague|pillé|pille|gasté|gaste|gastamos|bought|paid for|paid|got|picked up|purchased)\s+(?:(el|la|los|las|un|una|unos|unas|the|some|a|an)\b)?\s*/i, '')
    .replace(/^(de|del|en|para|por|en el|en la|for|at|in|on)\s+/i, '')
    .replace(/^[-–—:,/]+/, '')
    .replace(/[-–—:,/]+$/, '')
    .trim();

  if (!cleanTitle || cleanTitle.length < 2) {
    cleanTitle = 'Gasto General';
  } else {
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  }

  // Find best category match using the exported NLP engine
  const matchResult = findBestCategoryMatch(cleanTitle, categories);

  let matchedCategoryId = categories[0]?.id || '';
  let confidence = 0.75;

  if (matchResult) {
    matchedCategoryId = matchResult.categoryId;
    confidence = matchResult.confidence;
  }

  return {
    title: cleanTitle,
    amount,
    categoryId: matchedCategoryId,
    paidBy,
    splitBetween: 'both',
    splitModeOverride,
    confidence,
  };
}
