import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import SafeServiceClient from '../../src'
import config from '../utils/config'
import { getServiceClient } from '../utils/setupServiceClient'

chai.use(chaiAsPromised)

let serviceSdk: SafeServiceClient

describe('getPendingTransactions', () => {
  before(async () => {
    ;({ serviceSdk } = await getServiceClient(
      '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
    ))
  })

  it('should fail if safeAddress is empty', async () => {
    const safeAddress = ''
    await chai
      .expect(serviceSdk.getPendingTransactions(safeAddress))
      .to.be.rejectedWith('Invalid Safe address')
  })

  it('should fail if safeAddress is not checksummed', async () => {
    const safeAddress = '0xf9A2FAa4E3b140ad42AAE8Cac4958cFf38Ab08fD'.toLowerCase()
    await chai
      .expect(serviceSdk.getPendingTransactions(safeAddress))
      .to.be.rejectedWith('Checksum address validation failed')
  })

  it('should return an empty list if there are no pending transactions', async () => {
    const safeAddress = '0x3e04a375aC5847C690A7f2fF54b45c59f7eeD6f0' // Safe without pending transaction
    const transactionList = await serviceSdk.getPendingTransactions(safeAddress)
    chai.expect(transactionList.count).to.be.equal(0)
    chai.expect(transactionList.results.length).to.be.equal(0)
  })

  it('should return the the transaction list', async () => {
    const safeAddress = '0xf9A2FAa4E3b140ad42AAE8Cac4958cFf38Ab08fD' // Safe with pending transaction
    const transactionList = await serviceSdk.getPendingTransactions(safeAddress)
    chai.expect(transactionList.count).to.be.equal(2)
    chai.expect(transactionList.results.length).to.be.equal(2)
  })

  it('should return the the transaction list EIP-3770', async () => {
    const safeAddress = '0xf9A2FAa4E3b140ad42AAE8Cac4958cFf38Ab08fD' // Safe with pending transaction
    const eip3770SafeAddress = `${config.EIP_3770_PREFIX}:${safeAddress}`
    const transactionList = await serviceSdk.getPendingTransactions(eip3770SafeAddress)
    chai.expect(transactionList.count).to.be.equal(2)
    chai.expect(transactionList.results.length).to.be.equal(2)
  })
})
