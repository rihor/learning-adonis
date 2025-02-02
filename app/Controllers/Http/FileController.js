'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const File = use('App/Models/File')
const Helpers = use('Helpers')

/**
 * Resourceful controller for interacting with files
 */
class FileController {
  async show ({ params, response }) {
    const file = await File.findOrFail(params.id)

    return response.download(Helpers.tmpPath(`uploads/${file.file}`))
  }

  /**
   * Create/save a new file.
   * POST files
   */
  async store ({ request, response }) {
    try {
      if (!request.file('file')) return

      const upload = request.file('file', { size: '2mb' })

      // arquivos .txt tem subtype .plain, porém isso não funciona
      if (upload.subtype === 'plain') {
        upload.subtype = 'txt'
      }

      const fileName = `${Date.now()}.${upload.subtype}`

      // guarda o arquivo temporariamente em uma pasta
      await upload.move(Helpers.tmpPath('uploads'), {
        name: fileName
      })

      // checa se o arquivo foi movido
      if (!upload.moved()) {
        throw upload.error()
      }

      // salva no banco de dados
      const file = await File.create({
        file: fileName,
        name: upload.clientName,
        type: upload.type,
        subtype: upload.subtype
      })

      return file
    } catch (err) {
      return response
        .status(err.status)
        .send({ error: { message: 'Erro no upload de arquivo' } })
    }
  }
}

module.exports = FileController
