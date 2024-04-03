import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "KBaaS",
  description: "Knowledge Base as a Service",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'System Administration',
        items: [
            { text: 'sdfsdf', link: '/kbaas/1'},
            { text: 'fdsdsf', link: '/kbaas/2'},
            { text: 'fdsdsf', link: '/kbaas/3'},
            { text: 'fdsdsf', link: '/kbaas/4'},
            { text: 'fdsdsf', link: '/kbaas/5'}
        ]
      },
      { text: 'Penetration Testing',
        items: [
            { text: 'sdfsdf', link: '/kbaas/1'},
            { text: 'fdsdsf', link: '/kbaas/2'},
            { text: 'fdsdsf', link: '/kbaas/3'},
            { text: 'fdsdsf', link: '/kbaas/4'},
            { text: 'fdsdsf', link: '/kbaas/5'}
        ]
      },
      { text: 'CLI-fu',
        items: [
            { text: 'sdfsdf', link: '/kbaas/1'},
            { text: 'fdsdsf', link: '/kbaas/2'},
            { text: 'fdsdsf', link: '/kbaas/3'},
            { text: 'fdsdsf', link: '/kbaas/4'},
            { text: 'fdsdsf', link: '/kbaas/5'}
        ]
      },
      { text: 'Training',
        items: [
            { text: 'sdfsdf', link: '/kbaas/1'},
            { text: 'fdsdsf', link: '/kbaas/2'},
            { text: 'fdsdsf', link: '/kbaas/3'},
            { text: 'fdsdsf', link: '/kbaas/4'},
            { text: 'fdsdsf', link: '/kbaas/5'}
        ]
      }

    ],
    search: {
        provider: 'local'
    },
    lastUpdated: {
        text: 'Updated at',
        formatOptions: {
            dateStyle: 'full',
            timeStyle: 'medium'
        }
    },
    sidebar: [
      { text: 'System Administration',
        items: [
            { text: 'sdfsdf', link: '/kbaas/1'},
            { text: 'fdsdsf', link: '/kbaas/2'},
            { text: 'fdsdsf', link: '/kbaas/3'},
            { text: 'fdsdsf', link: '/kbaas/4'},
            { text: 'fdsdsf', link: '/kbaas/5'}
        ]
      },
      { text: 'Penetration Testing',
        items: [
            { text: 'sdfsdf', link: '/kbaas/1'},
            { text: 'fdsdsf', link: '/kbaas/2'},
            { text: 'fdsdsf', link: '/kbaas/3'},
            { text: 'fdsdsf', link: '/kbaas/4'},
            { text: 'fdsdsf', link: '/kbaas/5'}
        ]
      },
      { text: 'CLI-fu',
        items: [
            { text: 'sdfsdf', link: '/kbaas/1'},
            { text: 'fdsdsf', link: '/kbaas/2'},
            { text: 'fdsdsf', link: '/kbaas/3'},
            { text: 'fdsdsf', link: '/kbaas/4'},
            { text: 'fdsdsf', link: '/kbaas/5'}
        ]
      },
      { text: 'Training',
        items: [
            { text: 'sdfsdf', link: '/kbaas/1'},
            { text: 'fdsdsf', link: '/kbaas/2'},
            { text: 'fdsdsf', link: '/kbaas/3'},
            { text: 'fdsdsf', link: '/kbaas/4'},
            { text: 'fdsdsf', link: '/kbaas/5'}
        ]}
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    outline: [2,3],
  }
})
