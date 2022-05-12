/**
 * @type {import('vitepress').UserConfig}
 */

const config = {
  lang: 'pt-BR',
  title: 'Maestro',
  description: 'Use agora o Maestro UI para construir seus formulários no Zeev BPMS!',
  head: [
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css',
        integrity: 'sha512-+4zCK9k+qNFUR5X+cKL9EIR+ZOhtIloNl9GIKS57V1MyNsYpYcUrUeQc9vNfzsWfV28IaLL3i96P9sdNyeRssA==',
        crossorigin: 'anonymous'
      }
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://stackpath.bootstrapcdn.com/twitter-bootstrap/2.3.1/css/bootstrap-combined.min.css',
        integrity: 'sha384-AfZ+8dl93QPpFmy0Q1kFwfwG1NBplh51QAw7oZCXARa9KWcl9Xx/7vk16PCDna/T',
        crossorigin: 'anonymous'
      }
    ]
  ],
  themeConfig: {
    // repo: 'vuejs/vitepress'
    // docsBranch: 'main',
    editLinks: true,
    editLinkText: 'Sugerir Edição',
    nav: [
      { text: 'Documentação', link: '/' },
      { text: 'Exemplos', link: '/exemplos/' },
      { text: 'Sobre', link: '/sobre/' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Usar agora',
          children: [
            { text: 'Introdução', link: '/usar-agora' },
            { text: 'Instalação', link: '/usar-agora/instalacao' },
            { text: 'Customizar', link: '/usar-agora/customizar' }
          ]
        },
        {
          text: 'Motivação',
          children: [
            { text: 'Por quê', link: '/motivacao' },
            { text: 'Padrões de Design', link: '/motivacao/padroes-de-design' },
            { text: 'Design Tokens', link: '/motivacao/design-tokens' }
          ]
        },
        {
          text: 'Componentes',
          children: [
            {
              text: 'Componentes',
              children: [
                { text: 'Empty', link: '/components/empty' },
                { text: 'Tabs', link: '/components/tabs' }
              ]
            },
            {
              text: 'Elementos',
              children: [
                { text: 'Dot', link: '/elements/dot' },
                { text: 'Tag', link: '/elements/tag' }
              ]
            },
            {
              text: 'Formulário',
              children: [
                { text: 'Form Group', link: '/form/form-group' }
              ]
            }
          ]
        }
      ]
    },
  }
}

export default config
