/* eslint-disable no-console */
const fse = require('fs-extra')
const POSTCONFIG = require('../post.config')
const customFetcher = require('./dataFetcher')

const getData = async () => {
  const dataToWrite = {
    content: [],
  }
  for (const doc of POSTCONFIG.docs) {
    const data = await customFetcher(doc.id)
    dataToWrite.content.push(data)
  }
  console.log('DATTT___-->', dataToWrite)

  if (dataToWrite) {
    fse.outputFile(POSTCONFIG.dataPath, JSON.stringify(dataToWrite))
  }
}

getData()
