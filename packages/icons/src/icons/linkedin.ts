import createSupabaseIcon from '../createSupabaseIcon';

/**
 * @component @name Linkedin
 * @description Supabase SVG icon component, renders SVG Element with children.
 *
 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAxNiAxNiIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aAogICAgZmlsbD0iY3VycmVudENvbG9yIgogICAgZD0iTTAgMS44NTg1OUMwIDEuMzE5ODUgMC4xODAxODUgMC44NzU0MSAwLjU0MDU0MSAwLjUyNTI1M0MwLjkwMDg5NiAwLjE3NTA3OSAxLjM2OTM3IDAgMS45NDU5NSAwQzIuNTEyMjMgMCAyLjk3MDM5IDAuMTcyMzggMy4zMjA0NiAwLjUxNzE3MkMzLjY4MDgyIDAuODcyNzI3IDMuODYxIDEuMzM2MDIgMy44NjEgMS45MDcwN0MzLjg2MSAyLjQyNDI0IDMuNjg1OTggMi44NTUyMSAzLjMzNTkxIDMuMkMyLjk3NTU1IDMuNTU1NTYgMi41MDE5MyAzLjczMzMzIDEuOTE1MDYgMy43MzMzM0gxLjg5OTYxQzEuMzMzMzMgMy43MzMzMyAwLjg3NTE2NiAzLjU1NTU2IDAuNTI1MDk3IDMuMkMwLjE3NTAyNyAyLjg0NDQ0IDAgMi4zOTczIDAgMS44NTg1OVpNMC4yMDA3NzIgMTZWNS4yMDQwNEgzLjYyOTM0VjE2SDAuMjAwNzcyWk01LjUyODk2IDE2SDguOTU3NTNWOS45NzE3MkM4Ljk1NzUzIDkuNTk0NiA4Ljk5ODcyIDkuMzAzNjkgOS4wODEwOCA5LjA5ODk5QzkuMjI1MjIgOC43MzI2NSA5LjQ0NDAyIDguNDIyODkgOS43Mzc0NSA4LjE2OTdDMTAuMDMwOSA3LjkxNjQ5IDEwLjM5OSA3Ljc4OTkgMTAuODQxNyA3Ljc4OTlDMTEuOTk0OSA3Ljc4OTkgMTIuNTcxNCA4LjYwMzM2IDEyLjU3MTQgMTAuMjMwM1YxNkgxNlY5LjgxMDFDMTYgOC4yMTU0OCAxNS42Mzk2IDcuMDA2MDYgMTQuOTE4OSA2LjE4MTgyQzE0LjE5ODIgNS4zNTc1OCAxMy4yNDU4IDQuOTQ1NDUgMTIuMDYxOCA0Ljk0NTQ1QzEwLjczMzYgNC45NDU0NSA5LjY5ODg0IDUuNTQzNDMgOC45NTc1MyA2LjczOTM5VjYuNzcxNzJIOC45NDIwOEw4Ljk1NzUzIDYuNzM5MzlWNS4yMDQwNEg1LjUyODk2QzUuNTQ5NTQgNS41NDg4MiA1LjU1OTg1IDYuNjIwODYgNS41NTk4NSA4LjQyMDJDNS41NTk4NSAxMC4yMTk1IDUuNTQ5NTQgMTIuNzQ2MSA1LjUyODk2IDE2WiIKICAvPgo8L3N2Zz4K)
 *
 * @param {Object} props - Supabase icons props and any valid SVG attribute
 * @returns {JSX.Element} JSX Element
 *
 */
const Linkedin = createSupabaseIcon('Linkedin', [
  [
    'path',
    {
      fill: 'currentColor',
      d: 'M0 1.85859C0 1.31985 0.180185 0.87541 0.540541 0.525253C0.900896 0.175079 1.36937 0 1.94595 0C2.51223 0 2.97039 0.17238 3.32046 0.517172C3.68082 0.872727 3.861 1.33602 3.861 1.90707C3.861 2.42424 3.68598 2.85521 3.33591 3.2C2.97555 3.55556 2.50193 3.73333 1.91506 3.73333H1.89961C1.33333 3.73333 0.875166 3.55556 0.525097 3.2C0.175027 2.84444 0 2.3973 0 1.85859ZM0.200772 16V5.20404H3.62934V16H0.200772ZM5.52896 16H8.95753V9.97172C8.95753 9.5946 8.99872 9.30369 9.08108 9.09899C9.22522 8.73265 9.44402 8.42289 9.73745 8.1697C10.0309 7.91649 10.399 7.7899 10.8417 7.7899C11.9949 7.7899 12.5714 8.60336 12.5714 10.2303V16H16V9.8101C16 8.21548 15.6396 7.00606 14.9189 6.18182C14.1982 5.35758 13.2458 4.94545 12.0618 4.94545C10.7336 4.94545 9.69884 5.54343 8.95753 6.73939V6.77172H8.94208L8.95753 6.73939V5.20404H5.52896C5.54954 5.54882 5.55985 6.62086 5.55985 8.4202C5.55985 10.2195 5.54954 12.7461 5.52896 16Z',
      key: '1pyfjn',
    },
  ],
]);

export default Linkedin;
