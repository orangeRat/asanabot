import { Client } from 'asana'
import {json, RequestHandler, send} from 'micro'
import {get, post, router} from 'microrouter'

const personalAccessToken = 'asana`s token'
const projectId = 'here is a project ID' // because Asana cannot find task by title =(

const client = Client.create().useAccessToken(personalAccessToken)

const updateTicket: RequestHandler = async (req, res) => {
    const body = await json(req)

    const {
        message,
        author: {
            name
        }
    } = body.head_commit

    const { data } = await client.tasks.findByProject(projectId)
    const taskId = message.split(' ')[0]
    const tasks = data.filter(task => task.name.startsWith(`${taskId} `))
    const comments = body.commits
        .map((commit: {message: string}) =>
            `${name} made: ${commit.message}`
        )
        .join('\n')

    await client.tasks.addComment(tasks[0].gid, {
        text: comments,
    })

    return send(200)
}

const service: RequestHandler = (req, res) => {
    return send(200)
}

const notFound: RequestHandler = (req, res) => {
    return 'Not found'
}

module.exports = router(
    get('/', service),
    post('/update-ticket', updateTicket),
    get('*', notFound)
)
