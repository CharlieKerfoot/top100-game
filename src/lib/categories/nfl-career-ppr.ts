import type { Category } from './types';
import { nflCareerPprHints } from './hints/nfl-career-ppr';

export const nflCareerPpr: Category = {
  id: 'nfl-career-ppr',
  name: 'NFL All-Time Career PPR Fantasy Points',
  description: 'NFL players ranked by all-time career PPR fantasy points scored',
  tags: ['sports', 'football'],
  hints: nflCareerPprHints,
  items: [
    'Tom Brady', 'Drew Brees', 'Aaron Rodgers', 'Jerry Rice', 'Peyton Manning',
    'Brett Favre', 'Matthew Stafford', 'Ben Roethlisberger', 'Philip Rivers', 'Matt Ryan',
    'Dan Marino', 'Larry Fitzgerald', 'Russell Wilson', 'Emmitt Smith', 'Terrell Owens',
    'John Elway', 'Fran Tarkenton', 'Tony Gonzalez', 'Marshall Faulk', 'Eli Manning',
    'Randy Moss', 'LaDainian Tomlinson', 'Walter Payton', 'Marvin Harrison', 'Cris Carter',
    'Frank Gore', 'Steve Smith Sr.', 'Reggie Wayne', 'Anquan Boldin', 'Andre Johnson',
    'Isaac Bruce', 'Antonio Gates', 'Adrian Peterson', 'Brandon Marshall', 'Torry Holt',
    'Tim Brown', 'Wes Welker', 'Antonio Brown', 'Chad Johnson', 'Hines Ward',
    'Darren Sproles', 'Calvin Johnson', 'Rob Gronkowski', 'Barry Sanders', 'Thurman Thomas',
    'Marcus Allen', 'Edgerrin James', 'Shaun Alexander', 'Jamaal Charles', 'Chris Johnson',
    'Maurice Jones-Drew', 'Steven Jackson', 'Jamal Lewis', 'Greg Olsen', 'Shannon Sharpe',
    'Michael Irvin', 'Jimmy Smith', 'Keenan McCardell', 'Rod Smith', 'Art Monk',
    'Ricky Watters', 'Michael Pittman Sr.', 'Eric Moulds', 'Donald Driver', 'Keyshawn Johnson',
    'Derrick Mason', 'Vincent Jackson', 'Dez Bryant', 'Julio Jones', 'A.J. Green',
    'Demaryius Thomas', 'Eric Decker', 'Jeremy Maclin', 'Mike Wallace', 'Golden Tate',
    'Roddy White', 'Pierre Garcon', 'Hakeem Nicks', 'Stevie Johnson', 'Miles Austin',
    'Santonio Holmes', 'Vernon Davis', 'Owen Daniels', 'Dallas Clark', 'Deion Branch',
    'Plaxico Burress', 'Steve Smith (Baltimore)', 'Victor Cruz', 'Kevin Curtis', 'Percy Harvin',
    'Dwayne Bowe', 'Reggie Bush', 'Cordarrelle Patterson', 'Chris Ivory', 'BenJarvus Green-Ellis',
    'DeAngelo Williams', 'DeMarco Murray', 'Fred Jackson', 'Arian Foster', 'Danny Woodhead',
  ],
};
