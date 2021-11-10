/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import React from 'react'
import { createClient } from 'urql'

const APIURL =
  'https://api.studio.thegraph.com/query/13869/zoralivestreamtest/0.2'

const tokensQuery = `
  query {
    tokens(
      orderDirection: desc
      orderBy: createdAtTimestamp
      first: 100
    ) {
      id
      tokenID
      contentURI
      metadataURI
    }
  }
`

const client = createClient({
  url: APIURL
})

const Home = props => {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
      <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
        Displaying Tokens from Subgraph
      </h2>

      <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8 mt-10">
        {props.tokens.map(token => (
          <a key={token.id} href="#" className="group">
            <div className="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden xl:aspect-w-7 xl:aspect-h-8 h-96 justify-center flex items-center">
              {token.type === 'image' && (
                <div style={{ height: '320px', overflow: 'hidden' }}>
                  <img style={{ minHeight: '320px' }} src={token.contentURI} />
                </div>
              )}
              {token.type === 'video' && (
                <div className="relative">
                  <div
                    style={{
                      width: '288px',
                      height: '320px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0
                    }}
                  >
                    <video
                      height="auto"
                      controls
                      autoPlay
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'cover'
                      }}
                    >
                      <source src={token.contentURI} />
                    </video>
                  </div>
                </div>
              )}
              {token.type === 'audio' && (
                <audio controls>
                  <source src={token.contentURI} type="audio/ogg" />
                  <source src={token.contentURI} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
            {token.type === 'audio' && (
              <>
                <h3 className="mt-4 text-sm text-gray-700">
                  {token.meta.body.artist}
                </h3>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {token.meta.body.title}
                </p>
              </>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}

async function fetchData() {
  const {
    data: { tokens }
  } = await client.query(tokensQuery).toPromise()

  const tokenData = await Promise.all(
    tokens.map(
      async (token: { metadataURI: RequestInfo; type: string; meta: any }) => {
        let meta

        try {
          const metadata = await fetch(token.metadataURI)
          const response = await metadata.json()
          console.log(response)
          meta = response
        } catch (error) {}

        if (!meta) {
          return
        }

        if (!meta?.body?.mimeType) {
          return
        }

        if (meta.body.mimeType.includes('mp4')) {
          token.type = 'video'
        } else if (meta.body.mimeType.includes('wav')) {
          token.type = 'audio'
        } else {
          token.type = 'image'
        }

        token.meta = meta
        return token
      }
    )
  )

  return tokenData.filter(Boolean)
}

export async function getServerSideProps() {
  const data = await fetchData()

  return {
    props: {
      tokens: data
    }
  }
}

export default Home
