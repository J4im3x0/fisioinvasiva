import { withPayload } from '@payloadcms/next/withPayload'

export default withPayload({
  trailingSlash: true,
  async headers() {
    return [
      {
        source: '/brand/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
})
