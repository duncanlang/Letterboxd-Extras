import {watch} from 'rollup';

      const watcher = watch({
        ...rollupOptions,
        watch: {
          ...rollupOptions.watch,
          ...options.watch,
          notify: convertToNotifyOptions(resolvedChokidarOptions),
        },
      })

      watcher.on('event', (event) => {
        if (event.code === 'BUNDLE_START') {
          logger.info(colors.cyan(`\nbuild started...`))
          chunkMetadataMap.clearResetChunks()
        } else if (event.code === 'BUNDLE_END') {
          event.result.close()
          logger.info(colors.cyan(`built in ${event.duration}ms.`))
        } else if (event.code === 'ERROR') {
          const e = event.error
          enhanceRollupError(e)
          clearLine()
          logger.error(e.message, { error: e })
        }
      })

      return watcher