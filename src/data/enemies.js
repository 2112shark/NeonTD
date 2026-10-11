// Enemy and boss definitions, wave modifiers.
export const ED={
 drone:{name:'Дрон',hp:42,spd:1.15,rw:5,r:.26,col:'#ff5c7a'},
 scout:{name:'Скаут',hp:26,spd:2,rw:5,r:.22,col:'#ffe14d'},
 tank:{name:'Броневик',hp:130,spd:.65,rw:11,r:.33,armor:6,col:'#ff8a3d'},
 wasp:{name:'Оса',hp:48,spd:.95,rw:8,r:.26,air:1,col:'#4dffd2'},
 guard:{name:'Страж',hp:70,spd:.9,rw:10,r:.29,shield:65,col:'#5c9dff'},
 split:{name:'Делитель',hp:95,spd:.9,rw:9,r:.3,col:'#e07dff',splits:'shard'},
 shard:{name:'Осколок',hp:22,spd:1.35,rw:2,r:.17,col:'#e07dff'},
 medic:{name:'Лекарь',hp:62,spd:.85,rw:9,r:.27,col:'#8dff5c',heal:{r:1.6,p:.07,cd:2.2}},
 jammer:{name:'Глушилка',hp:92,spd:.8,rw:11,r:.28,col:'#ff3dc8',jam:{r:1.5,t:2.2,cd:3.2}},
 blink:{name:'Прыгун',hp:56,spd:.95,rw:8,r:.24,col:'#cfd8ff',blink:{d:2.2,cd:3.6}},
 carrier:{name:'Носитель',hp:175,spd:.6,rw:14,r:.34,armor:2,col:'#e8c26b',spawns:{t:'mite',n:3}},
 mite:{name:'Мошка',hp:17,spd:1.45,rw:2,r:.15,air:1,col:'#ffe7a8'},
 boss:{name:'Колосс',hp:1350,spd:.42,rw:150,r:.52,armor:8,shield:280,col:'#ff2e4d',boss:1},
 queen:{name:'Рой-матка',hp:1300,spd:.4,rw:170,r:.55,shield:220,col:'#2effb0',boss:1,brood:{t:'wasp',n:2,cd:6}},
 wrecker:{name:'Разрушитель',hp:1800,spd:.38,rw:220,r:.56,armor:7,shield:300,col:'#ff6a2e',boss:1,gun:{r:3.2,cd:4.2,t:6}},
};
export const BOSSES=['boss','queen','wrecker'];
export const BOSS_LAP=10,BOSS_LAP_HEAL=.3; // a mission boss that breaks through on normal difficulty costs 10 core, recovers 30% health and walks the route again
export const MODS={
 fast:{name:'Ускоренные',desc:'+20% скорости',long:'Враги двигаются на 20% быстрее',col:'#ffe14d'},
 regen:{name:'Регенерация',desc:'лечатся на 2% в секунду',long:'Враги восстанавливают 2% здоровья в секунду, боссы в пять раз медленнее',col:'#6dff9e'},
 armor:{name:'Бронированные',desc:'+3 брони, кроме боссов',long:'Все враги, кроме боссов, получают 3 единицы брони',col:'#ff8a3d'},
 cloak:{name:'Невидимки',desc:'видны в зоне Крио и Теслы и вплотную к башням',long:'Враги невидимы, пока не попадут в зону Крио или Теслы или не подойдут к любой башне ближе чем на полторы клетки',col:'#a98bff'},
 swarm:{name:'Рой',desc:'в 1.5 раза больше, на 35% слабее',long:'Врагов в полтора раза больше, но каждый на 35% слабее',col:'#ff5c7a'},
};
export const CLOAK_NEAR=2.25; // squared distance at which any tower sees an invisible enemy
export const MODE_NAMES=['Первый','Последний','Сильный','Ближний'];
