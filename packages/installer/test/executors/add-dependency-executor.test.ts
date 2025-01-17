import { vi, expect, describe, it } from 'vitest'
import { spawn } from 'cross-spawn'
import * as fs from 'fs-extra'
import * as AddDependencyExecutor from '../../src/executors/add-dependency-executor'

vi.mock('fs-extra', () => {
  return {
    existsSync: vi.fn(),
  }
})
vi.mock('cross-spawn')

describe('add dependency executor', () => {
  const testConfiguration = {
    stepId: 'addDependencies',
    stepName: 'Add dependencies',
    stepType: 'add-dependency',
    explanation: 'This step will add some dependencies for testing purposes',
    packages: [{ name: 'typescript', version: '4' }, { name: 'ts-node' }],
  }

  it('should properly identify executor', () => {
    const wrongConfiguration = {
      stepId: 'wrongStep',
      stepName: 'Wrong Step',
      stepType: 'wrong-type',
      explanation: 'This step is wrong',
    }
    expect(AddDependencyExecutor.isAddDependencyExecutor(wrongConfiguration)).toBeFalsy()
    expect(AddDependencyExecutor.isAddDependencyExecutor(testConfiguration)).toBeTruthy()
  })

  it('should choose proper package manager according to lock file', () => {
    fs.existsSync.mockReturnValueOnce(true)
    expect(AddDependencyExecutor.getPackageManager()).toEqual('yarn')
    expect(AddDependencyExecutor.getPackageManager()).toEqual('npm')
  })

  it('should issue proper commands according to the specified packages', async () => {
    const mockedSpawn = mockSpawn()
    vi.mocked(spawn).mockImplementation(mockedSpawn.spawn as any)

    // NPM
    fs.existsSync.mockReturnValue(false)
    await AddDependencyExecutor.installPackages(testConfiguration.packages, true)
    await AddDependencyExecutor.installPackages(testConfiguration.packages, false)

    // Yarn
    fs.existsSync.mockReturnValue(true)
    await AddDependencyExecutor.installPackages(testConfiguration.packages, true)
    await AddDependencyExecutor.installPackages(testConfiguration.packages, false)

    expect(mockedSpawn.calls.length).toEqual(4)
    expect(mockedSpawn.calls[0]).toEqual('npm install --save-dev typescript@4 ts-node')
    expect(mockedSpawn.calls[1]).toEqual('npm install typescript@4 ts-node')
    expect(mockedSpawn.calls[2]).toEqual('yarn add -D typescript@4 ts-node')
    expect(mockedSpawn.calls[3]).toEqual('yarn add typescript@4 ts-node')
  })
})

/**
 * Primitive mock of spawn function
 */
const mockSpawn = () => {
  const calls: string[] = []

  return {
    spawn: (command: string, args: string[], _: unknown = {}) => {
      calls.push(`${command} ${args.join(' ')}`)

      return {
        on: (_: string, resolve: () => void) => resolve(),
      }
    },
    calls,
  }
}
