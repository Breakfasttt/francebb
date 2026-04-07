const f = require('./generated-client');
console.log('Tournament fields:', Object.keys(f.Prisma.TournamentScalarFieldEnum).filter(k => k.toLowerCase().includes('cdf')));
