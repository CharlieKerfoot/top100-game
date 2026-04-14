// Source: NordPass Top 200 Most Common Passwords (2024 report)
// https://nordpass.com/most-common-passwords-list/
// Data from NordPass/NordStellar analysis of public data breaches and dark web
// repositories, published November 2024.
import type { GameList } from './types';
import { mostCommonPasswordsHints } from './hints';

export const mostCommonPasswords: GameList = {
  id: 'most-common-passwords',
  name: 'Most Common Passwords',
  description: 'The most frequently used passwords worldwide (NordPass 2024)',
  topics: ['internet'],
  hints: mostCommonPasswordsHints,
  valueLabel: 'Frequency Rank',
  items: [
    "123456",        // #1  — 3,018,050 users
    "123456789",     // #2  — 1,625,135 users
    "12345678",      // #3  — 884,740 users
    "password",      // #4  — 692,151 users
    "qwerty123",     // #5  — 642,638 users
    "qwerty1",       // #6  — 583,630 users
    "111111",        // #7  — 459,730 users
    "12345",         // #8  — 395,573 users
    "secret",        // #9  — 363,491 users
    "123123",        // #10 — 351,576 users
    "1234567890",    // #11
    "1234567",       // #12
    "000000",        // #13
    "qwerty",        // #14
    "abc123",        // #15
    "password1",     // #16
    "iloveyou",      // #17
    "11111111",      // #18
    "dragon",        // #19
    "monkey",        // #20
    "123123123",     // #21
    "123321",        // #22
    "qwertyuiop",    // #23
    "00000000",      // #24
    "Password",      // #25
    "zag12wsx",      // #26 — keyboard pattern
    "1q2w3e4r",      // #27
    "superman",      // #28
    "sunshine",      // #29
    "princess",      // #30
    "master",        // #31
    "654321",        // #32
    "baseball",      // #33
    "football",      // #34
    "shadow",        // #35
    "michael",       // #36
    "charlie",       // #37
    "donald",        // #38
    "soccer",        // #39
    "batman",        // #40
    "1234",          // #41
    "1234561",       // #42
    "dragon1",       // #43
    "pass",          // #44
    "login",         // #45
    "hello",         // #46
    "welcome",       // #47
    "trustno1",      // #48
    "letmein",       // #49
    "test",          // #50
    "admin",         // #51
    "monkey1",       // #52
    "thomas",        // #53
    "daniel",        // #54
    "george",        // #55
    "andrew",        // #56
    "jessica",       // #57
    "hannah",        // #58
    "jennifer",      // #59
    "michelle",      // #60
    "hunter",        // #61
    "ranger",        // #62
    "joshua",        // #63
    "robert",        // #64
    "jordan",        // #65
    "buster",        // #66
    "jessica1",      // #67
    "harley",        // #68
    "anthony",       // #69
    "william",       // #70
    "liverpool",     // #71
    "chelsea",       // #72
    "arsenal",       // #73
    "ranger1",       // #74
    "ginger",        // #75
    "sparky",        // #76
    "batman1",       // #77
    "tigger",        // #78
    "cooper",        // #79
    "pepper",        // #80
    "maverick",      // #81
    "cookie",        // #82
    "matthew",       // #83
    "austin",        // #84
    "cheese",        // #85
    "bandit",        // #86
    "dakota",        // #87
    "junior",        // #88
    "victor",        // #89
    "samson",        // #90
    "amanda",        // #91
    "diamond",       // #92
    "summer",        // #93
    "butter",        // #94
    "yankees",       // #95
    "maggie",        // #96
    "hockey",        // #97
    "guitar",        // #98
    "flower",        // #99
    "yellow",        // #100
  ],
  values: [
    "#1", "#2", "#3", "#4", "#5",
    "#6", "#7", "#8", "#9", "#10",
    "#11", "#12", "#13", "#14", "#15",
    "#16", "#17", "#18", "#19", "#20",
    "#21", "#22", "#23", "#24", "#25",
    "#26", "#27", "#28", "#29", "#30",
    "#31", "#32", "#33", "#34", "#35",
    "#36", "#37", "#38", "#39", "#40",
    "#41", "#42", "#43", "#44", "#45",
    "#46", "#47", "#48", "#49", "#50",
    "#51", "#52", "#53", "#54", "#55",
    "#56", "#57", "#58", "#59", "#60",
    "#61", "#62", "#63", "#64", "#65",
    "#66", "#67", "#68", "#69", "#70",
    "#71", "#72", "#73", "#74", "#75",
    "#76", "#77", "#78", "#79", "#80",
    "#81", "#82", "#83", "#84", "#85",
    "#86", "#87", "#88", "#89", "#90",
    "#91", "#92", "#93", "#94", "#95",
    "#96", "#97", "#98", "#99", "#100",
  ],
};
