import type { CommandHandler } from '../types';

export const launch: CommandHandler = async (args, _flags, _flagValues, context) => {
  if (!context.eventBus) {
    return ['launch: EventBus not available. Cannot launch apps.'];
  }
  
  if (args.length === 0) {
    return ['launch: missing app ID'];
  }
  
  const appId = args[0];
  const appArgs = args.slice(1);
  
  try {
    context.eventBus.emit('taskbar:shortcut:clicked', {
      appId,
      forceNew: true,
      args: appArgs,
    }, { source: 'terminal' });
    
    return [`Launched app: ${appId}`];
  } catch (error) {
    return [`launch: ${error instanceof Error ? error.message : String(error)}`];
  }
};

export const run = launch; // Alias

