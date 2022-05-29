import { Sequelize } from 'sequelize'
import { dbConfig } from 'config/index'

const sequelize = new Sequelize(dbConfig)

async function checkDBConnect() {
  await sequelize.authenticate()
  console.log('db connect success')
}
checkDBConnect()
export default sequelize
