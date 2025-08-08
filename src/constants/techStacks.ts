import {
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiJavascript,
  SiPython,
  SiVuedotjs,
  SiAngular,
  SiDocker,
  SiKubernetes,
  SiGit,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiGraphql,
  SiAmazon,
  SiTailwindcss,
  SiPrisma,
  SiVercel,
  SiGithub,
} from 'react-icons/si';

export interface TechStack {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  url: string;
}

export const techStacks: TechStack[] = [
  { name: 'TypeScript', icon: SiTypescript, color: 'text-blue-600', url: 'https://www.typescriptlang.org/' },
  { name: 'React', icon: SiReact, color: 'text-cyan-500', url: 'https://react.dev/' },
  { name: 'Next.js', icon: SiNextdotjs, color: 'text-black', url: 'https://nextjs.org/' },
  { name: 'Vue.js', icon: SiVuedotjs, color: 'text-green-500', url: 'https://vuejs.org/' },
  { name: 'Angular', icon: SiAngular, color: 'text-red-600', url: 'https://angular.io/' },
  { name: 'JavaScript', icon: SiJavascript, color: 'text-yellow-500', url: 'https://developer.mozilla.org/ko/docs/Web/JavaScript' },
  { name: 'Node.js', icon: SiNodedotjs, color: 'text-green-600', url: 'https://nodejs.org/' },
  { name: 'Python', icon: SiPython, color: 'text-blue-500', url: 'https://www.python.org/' },
  { name: 'PostgreSQL', icon: SiPostgresql, color: 'text-blue-700', url: 'https://www.postgresql.org/' },
  { name: 'MongoDB', icon: SiMongodb, color: 'text-green-700', url: 'https://www.mongodb.com/' },
  { name: 'Redis', icon: SiRedis, color: 'text-red-500', url: 'https://redis.io/' },
  { name: 'Docker', icon: SiDocker, color: 'text-blue-600', url: 'https://www.docker.com/' },
  { name: 'Kubernetes', icon: SiKubernetes, color: 'text-blue-700', url: 'https://kubernetes.io/' },
  { name: 'Git', icon: SiGit, color: 'text-orange-600', url: 'https://git-scm.com/' },
  { name: 'GitHub', icon: SiGithub, color: 'text-black', url: 'https://github.com/' },
  { name: 'Tailwind', icon: SiTailwindcss, color: 'text-cyan-400', url: 'https://tailwindcss.com/' },
  { name: 'Prisma', icon: SiPrisma, color: 'text-slate-700', url: 'https://www.prisma.io/' },
  { name: 'GraphQL', icon: SiGraphql, color: 'text-pink-600', url: 'https://graphql.org/' },
  { name: 'AWS', icon: SiAmazon, color: 'text-orange-500', url: 'https://aws.amazon.com/' },
  { name: 'Vercel', icon: SiVercel, color: 'text-black', url: 'https://vercel.com/' },
];
