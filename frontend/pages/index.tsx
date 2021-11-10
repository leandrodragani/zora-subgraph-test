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
  console.log(props)
  return (
    <div className="grid grid-cols-4 gap-4 px-10 py-10">
      {props.tokens.map(token => {
        return (
          <div
            key={token.id}
            className="shadow-lg bg-transparent rounded-2xl overflow-hidden"
          >
            <div key={token.contentURI} className="w-100% h-100%">
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
              <div className="px-2 pt-2 pb-10">
                <h3
                  style={{ height: 100 }}
                  className="text-2xl p-4 pt-6 font-semibold"
                >
                  {token.meta.name}
                </h3>
                <h2
                  style={{ height: 100 }}
                  className="text-xl p-4 pt-6 font-semibold"
                >
                  {token.meta.description}
                </h2>
              </div>
            </div>
            <div className="bg-black p-10">
              <p className="text-white">Price</p>
            </div>
          </div>
        )
      })}
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
