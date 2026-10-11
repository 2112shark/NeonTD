// Campaign chapters, missions, nightmare mode, operator lines.
import type { EnemyType } from './enemies.ts';
import type { TowerType } from './towers.ts';

export interface Chapter { name: string; th: string; sub: string }
/** A star condition: k is the kind, n its threshold where one is needed */
export interface StarCond { k: 'lives' | 'noabil' | 'nosell' | 'flawless' | 'types' | 'boss' | 'early' | 'towers'; n?: number }
export interface Mission {
  id: string;
  /** chapter index */
  ch: number;
  name: string;
  lay: string;
  /** 0 for flow missions */
  waves: number;
  /** enemy health multiplier, normal and nightmare */
  hp: number; nmh: number;
  gold: number;
  goal: 'survive' | 'limit' | 'boss' | 'cores' | 'ban' | 'flow';
  /** enemy type -> first wave it appears in */
  roster: Partial<Record<EnemyType, number>>;
  /** star 2 and star 3 conditions; star 1 is the win */
  s2: StarCond; s3: StarCond;
  brief: string[];
  open: string; win: string;
  /** enemy introduced by this mission */
  newE?: EnemyType;
  /** tower limit */
  limit?: number;
  boss?: EnemyType;
  nodeN?: number; debrisN?: number;
  ban?: TowerType[];
  /** flow missions: seconds to hold */
  flowT?: number;
  // set at startup by core/map
  /** index in MISSIONS */
  i: number;
  map: GameMap;
}
export interface BossLines { spawn: string; phase: string; rage: string; lap: string }

/* campaign */
export const CHAPTERS: Chapter[]=[
 {name:'Сетевой узел',th:'net',sub:'Внешний периметр базы. Здесь рубеж встречает первые атаки.'},
 {name:'Серверная',th:'srv',sub:'Стойки с данными. Враги хитрее: лечат друг друга, глушат башни и прыгают.'},
 {name:'Реакторный отсек',th:'hot',sub:'Сердце базы. Короткие пути, жаркие волны и самый опасный босс.'},
];
const ALL: Mission['roster']={drone:1,scout:2,tank:3,wasp:4,guard:5,split:6,medic:6,jammer:7,blink:7,carrier:8};
// i and map are filled in by core/map at startup
export const MISSIONS=([
 {id:'m1',ch:0,name:'Первый контакт',lay:'ring',waves:8,hp:1.63,nmh:3.64,gold:240,goal:'survive',roster:{drone:1,scout:3},
  s2:{k:'lives',n:15},s3:{k:'noabil'},
  brief:['Командир, на связи ВЕГА, ИИ-оператор рубежа.','К узлу идут дроны. Лазер бьёт одну цель, пушка накрывает группу. Начнём с них.'],
  open:'Первая волна уже на подходе. Ставьте башни у поворотов пути.',win:'Узел цел. Отличное начало, командир.'},
 {id:'m2',ch:0,name:'Холодный приём',lay:'zig',waves:10,hp:1.84,nmh:3.36,gold:250,goal:'survive',roster:{drone:1,scout:2,tank:4},newE:'tank',
  s2:{k:'lives',n:15},s3:{k:'nosell'},
  brief:['Сканеры видят Броневики: медленные машины с толстой бронёй.','Я открыла Крио. Замедленный враг дольше стоит под огнём, а пушка бьёт сразу нескольких.'],
  open:'Крио ставьте там, где путь делает петлю: замедление накроет обе линии.',win:'Броневики остановлены. Крио себя оправдал.'},
 {id:'m3',ch:0,name:'Воздушная тревога',lay:'hook',waves:12,hp:1.79,nmh:1.89,gold:260,goal:'survive',roster:{drone:1,scout:2,tank:3,wasp:4},newE:'wasp',
  s2:{k:'lives',n:15},s3:{k:'flawless'},
  brief:['Осы летят напрямую и срезают углы маршрута.','Пушка их не достаёт. Держите лазеры и крио у бирюзового пунктира: это путь ос.'],
  open:'Путь короткий. Стройте плотно с первых волн.',win:'Небо чистое. Осы больше не жужжат.'},
 {id:'m4',ch:0,name:'Шесть опор',lay:'spiral',waves:12,hp:3.06,nmh:1.92,gold:280,goal:'limit',limit:6,roster:{drone:1,scout:2,tank:3,wasp:5,guard:4},newE:'guard',
  s2:{k:'lives',n:15},s3:{k:'types',n:2},
  brief:['Энергии хватает только на шесть башен одновременно.','Улучшайте вместо того, чтобы строить. И осторожно со Стражами: их щит восстанавливается, если по нему не стрелять.'],
  open:'Ядро в центре спирали. Сильные башни у середины достанут сразу несколько витков.',win:'Шесть башен, и ни одной лишней. Красиво.'},
 {id:'m5',ch:0,name:'Колосс',lay:'cross',waves:12,hp:2.15,nmh:2.37,gold:300,goal:'boss',boss:'boss',roster:{drone:1,scout:2,tank:3,wasp:4,guard:5,split:6},newE:'split',
  s2:{k:'lives',n:15},s3:{k:'boss',n:60},
  brief:['К узлу идёт Колосс: броня, щит и огромный запас прочности.','На половине здоровья он вызовет охрану. Держите ЭМИ и орбитальный удар наготове.'],
  open:'Путь пересекает сам себя. Башня у перекрёстка стреляет по двум участкам.',win:'Колосс повержен. Сетевой узел в безопасности.'},
 {id:'m6',ch:1,name:'Разряд',lay:'serp',nodeN:0,debrisN:2,waves:14,hp:2.15,nmh:2.07,gold:300,goal:'survive',roster:{drone:1,scout:2,tank:3,wasp:4,guard:5,medic:3,split:7},newE:'medic',
  s2:{k:'lives',n:15},s3:{k:'early',n:4},
  brief:['Серверная. Здесь пригодится Тесла: её молния перескакивает между целями.','Новая угроза: Лекари чинят соседей. Коснитесь врага, и все башни рядом будут бить его.','Завалы у пути можно расчистить за кредиты: коснитесь завала.'],
  open:'Тесла рядом с Крио бьёт сильнее. Связь между ними видна пунктиром.',win:'Разряд прошёл как надо. Серверная держится.'},
 {id:'m7',ch:1,name:'Два ядра',lay:'twin',nodeN:0,debrisN:2,waves:14,hp:1.22,nmh:2.18,gold:320,goal:'cores',roster:{drone:1,scout:2,tank:3,guard:4,wasp:5,medic:6,split:6},
  s2:{k:'lives',n:8},s3:{k:'noabil'},
  brief:['Атака идёт по двум линиям, и у каждой своё ядро.','Если падёт любое из них, рубеж потерян. Башни в центре достают обе линии.'],
  open:'Обе линии начинаются у одних ворот. Там самое выгодное место для первой башни.',win:'Оба ядра целы. Вы держите две линии как одну.'},
 {id:'m8',ch:1,name:'Дальний выстрел',lay:'rails',nodeN:0,debrisN:3,waves:15,hp:1.9,nmh:1.98,gold:320,goal:'survive',roster:{drone:1,scout:2,tank:3,jammer:3,wasp:4,guard:5,medic:6,split:6},newE:'jammer',
  s2:{k:'lives',n:15},s3:{k:'towers',n:8},
  brief:['Снайпер готов к работе: большая дальность и критические выстрелы.','Глушилки отключают башни рядом с собой. Ставьте часть обороны подальше от пути.'],
  open:'Длинные прямые участки идеальны для снайпера.',win:'Глушилки замолчали. Хорошая стрельба.'},
 {id:'m9',ch:1,name:'Без артиллерии',lay:'fork',nodeN:0,debrisN:2,waves:15,hp:1.66,nmh:1.86,gold:330,goal:'ban',ban:['cannon'],roster:{drone:1,scout:2,blink:3,tank:4,wasp:4,guard:5,medic:5,split:6,jammer:7},newE:'blink',
  s2:{k:'lives',n:15},s3:{k:'nosell'},
  brief:['Пушки здесь запрещены: взрывы перегреют стойки.','Прыгуны перескакивают вперёд по маршруту. Стрелку на развилке можно переключать касанием.'],
  open:'Переключите стрелку туда, где ваша оборона сильнее.',win:'Без единой пушки. Серверная вам благодарна.'},
 {id:'m10',ch:1,name:'Рой-матка',lay:'nest',nodeN:0,debrisN:3,waves:16,hp:2.03,nmh:2.1,gold:340,goal:'boss',boss:'queen',roster:{drone:1,wasp:2,scout:2,tank:3,guard:5,medic:5,split:6,blink:6,jammer:7},
  s2:{k:'lives',n:15},s3:{k:'boss',n:85},
  brief:['Рой-матка рожает ос прямо на марше.','Нужна сильная оборона против воздуха. На половине здоровья она выпустит весь рой.'],
  open:'Осы режут углы по диагонали. Лазеры и тесла в центре карты достанут их.',win:'Матка уничтожена, рой рассеян. Серверная спасена.'},
 {id:'m11',ch:2,name:'Перегрев',lay:'breach',nodeN:2,debrisN:2,waves:16,hp:2.96,nmh:2.02,gold:340,goal:'survive',roster:{drone:1,scout:2,carrier:3,tank:3,wasp:4,guard:4,split:5,medic:5,jammer:6,blink:6},newE:'carrier',
  s2:{k:'lives',n:15},s3:{k:'flawless'},
  brief:['Реакторный отсек. Путь короткий, а враги злее. Я открыла Гравитон: его воронка вяжет врагов и роняет летающих на землю.','Носители при гибели выпускают летающих Мошек. Добивайте Носителей подальше от ядра.','Светящиеся гнёзда на карте это энергоузлы: башня на узле бьёт сильнее и дальше.'],
  open:'Здесь каждая клетка на счету. Начните с крио у первого поворота.',win:'Перегрев снят. Реактор работает в норме.'},
 {id:'m12',ch:2,name:'Непрерывный поток',lay:'loop',nodeN:2,debrisN:2,waves:0,flowT:180,hp:1.12,nmh:2.1,gold:420,goal:'flow',roster:ALL,
  s2:{k:'lives',n:15},s3:{k:'noabil'},
  brief:['Шлюзы реактора открыты, и волны пойдут без пауз.','Продержитесь три минуты. Потом я запущу продувку отсека, и всё на поле сгорит.'],
  open:'Поток пошёл. Каждые десять секунд новая группа.',win:'Продувка завершена. Отсек чист.'},
 {id:'m13',ch:2,name:'Энергосеть',lay:'circuit',nodeN:4,debrisN:2,waves:18,hp:3.36,nmh:1.71,gold:360,goal:'survive',roster:ALL,
  s2:{k:'lives',n:15},s3:{k:'types',n:3},
  brief:['Энергосеть отсека под ударом: здесь идут все известные нам враги.','Готов Генератор: он не стреляет, но приносит кредиты и усиливает соседние башни.','Четыре энергоузла на карте. Займите их сильными башнями.'],
  open:'Смешанные волны. Нужна оборона и от земли, и от воздуха.',win:'Энергосеть цела. Ещё немного, командир.'},
 {id:'m14',ch:2,name:'Последний рубеж',lay:'twin2',nodeN:2,debrisN:2,waves:18,hp:1.08,nmh:2.57,gold:380,goal:'cores',roster:ALL,
  s2:{k:'lives',n:8},s3:{k:'early',n:5},
  brief:['Два ядра реактора и две линии атаки.','Линии сходятся в центре карты. Это ваш шанс прикрыть обе сразу.'],
  open:'Середина между линиями ваша главная позиция.',win:'Последний рубеж выстоял. Остался только Разрушитель.'},
 {id:'m15',ch:2,name:'Разрушитель',lay:'reactor',nodeN:2,debrisN:3,waves:20,hp:1.85,nmh:2.19,gold:400,goal:'boss',boss:'wrecker',roster:ALL,
  s2:{k:'lives',n:15},s3:{k:'boss',n:80},
  brief:['Разрушитель: тяжёлый бот, который выжигает башни.','Он выводит из строя башни рядом с путём. Дальнобойные башни в безопасности, держите их в глубине.'],
  open:'Это решающий бой. Используйте всё, чему научились.',win:'Разрушитель уничтожен. База спасена, командир. Спасибо.'},
] satisfies Omit<Mission, 'i' | 'map'>[]) as Mission[];
/** nightmare multipliers */
export const NM: { hp: number; gold: number }={hp:1.55,gold:.85};
// what the operator says when an enemy type shows up for the first time
export const ELINE: Partial<Record<EnemyType, string>>={
 tank:'Броневик на подходе. Броня режет слабый урон: нужны мощные выстрелы.',
 wasp:'Воздух! Осы летят напрямую, пушка их не достанет.',
 guard:'Стражи под щитом. Не давайте щиту восстановиться.',
 split:'Делитель при гибели распадётся на два быстрых осколка.',
 medic:'Вижу Лекаря. Коснитесь его, чтобы все башни рядом сосредоточили огонь.',
 jammer:'Глушилка! Она отключает башни рядом с собой.',
 blink:'Прыгун перескакивает вперёд. Держите оборону и ближе к ядру.',
 carrier:'Носитель. После гибели из него вылетят мошки.',
};
export const BL: Partial<Record<EnemyType, BossLines>>={
 boss:{spawn:'Колосс на подходе. Коснитесь его, и все башни будут бить прежде всего по нему.',phase:'Колосс вызывает охрану!',rage:'Колосс в ярости и ускоряется!',lap:'Колосс прорвался к ядру, восстановил силы и пошёл на второй круг! Второго прорыва ядро не выдержит.'},
 queen:{spawn:'Рой-матка на подходе. Коснитесь её, иначе башни отвлекутся на ос.',phase:'Матка выпускает весь рой!',rage:'Матка рожает ос всё быстрее!',lap:'Матка прорвалась, подлечилась и уходит на второй круг! Добейте её, второго прорыва ядро не выдержит.'},
 wrecker:{spawn:'Разрушитель на подходе. Он жжёт башни у пути, держите фокус огня на нём.',phase:'Разрушитель бьёт уже по двум башням!',rage:'Разрушитель ускоряется!',lap:'Разрушитель прорвался, залатал броню и идёт на второй круг! Второго удара ядро не переживёт.'},
};
