import { Elysia, t } from 'elysia';
import { html } from '@elysiajs/html'
import { swagger } from '@elysiajs/swagger'

const PORT = 3002
let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}

const app = new Elysia()
  .use(swagger())
  .use(html())
  .get('/', () => `<h1>Hello World!</h1>`, {
    response: t.String()
  })
  .get('/api/notes', () => notes, {
    response: t.Array(
      t.Object({
        id: t.Numeric(),
        content: t.String(),
        important: t.Boolean()
      })
    )
  })
  .get('/api/notes/:id', ({ params: {id}, set }) => {
    const note = notes.find(n => n.id === id)
    if (note) {
      return note
    } else {
      set.status = 404
      throw new Error('Resource not found')
    }
  }, {
    params: t.Object({
      id: t.Numeric()
    }),
    response: t.Object({
      content: t.String(),
      important: t.Boolean(),
      id: t.Numeric()
    }),
    error: ({code, error}) => {
      switch(code) {
        case 'VALIDATION':
          return {
            message: 'id is not numeric',
            error: error
          }
      }
    }
  })
  .post('/api/notes', ({ body }) => {
    console.log(body)
    const note = {
      content: body.content,
      important: body.important || false,
      id: generateId(),
    }
    notes = notes.concat(note)
    return note
  }, {
    body: t.Object({
      content: t.String(),
      important: t.Optional(t.Boolean())
    }),
    response: t.Object({
      content: t.String(),
      important: t.Boolean(),
      id: t.Numeric()
    }),
    error: ({code, error}) => {
      switch (code) {
				case 'VALIDATION':
          return {
            message: 'content missing ',
            error
          }
			}
    }
  })
  .delete('/api/notes/:id', ({ params: { id }, set}) => {
    notes = notes.filter(note => note.id !== id)
    set.status = 204
    return
  }, {
    params: t.Object({
      id: t.Numeric()
    })
  })

app.listen(PORT, () => console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`))