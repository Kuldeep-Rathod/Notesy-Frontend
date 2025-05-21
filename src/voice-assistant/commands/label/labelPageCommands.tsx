import { LabelI } from '@/interfaces/labels';

interface LabelPageState {
    setNewLabelName: (name: string) => void;
}

interface useLabelPageCommandsProps {
    labels: LabelI[];
    state: LabelPageState;
    handlers: {
        createLabel: () => void;
        handleDeleteLabel: (labelName: string) => void;
        handleRenameLabel: (oldName: string, newName: string) => void;
    };
}

export const useLabelPageCommands = ({
    state,
    labels,
    handlers,
}: useLabelPageCommandsProps) => {
    const extractCleanUserName = (fullPhrase: string, prefixes: string[]) => {
        for (const prefix of prefixes) {
            if (fullPhrase.toLowerCase().startsWith(prefix)) {
                return fullPhrase.substring(prefix.length).trim();
            }
        }
        return fullPhrase.trim();
    };

    return [
        {
            command: ['new label *', 'new tag *'],
            callback: (fullPhrase: string) => {
                const cleanLabelName = extractCleanUserName(fullPhrase, [
                    'new label',
                    'new tag',
                ]);
                state.setNewLabelName(cleanLabelName);
            },
        },
        {
            command: ['create label', 'create tag', 'create'],
            callback: () => {
                handlers.createLabel();
            },
        },

        {
            command: [
                'delete label *',
                'remove label *',
                'delete tag *',
                'remove tag *',
            ],
            callback: (labelName: string) => {
                console.log('label name', labelName);
                if (
                    labelName &&
                    labels.some(
                        (label) =>
                            label.name.toLowerCase() === labelName.toLowerCase()
                    )
                ) {
                    handlers.handleDeleteLabel(labelName);
                }
            },
        },
        {
            command: [
                'rename label * to *',
                'change label * to *',
                'rename tag * to *',
                'change tag * to *',
            ],
            callback: (oldName: string, newName: string) => {
                console.log(oldName, newName);
                if (
                    oldName &&
                    newName &&
                    labels.some(
                        (label) =>
                            label.name.toLowerCase() === oldName.toLowerCase()
                    )
                ) {
                    handlers.handleRenameLabel(oldName, newName);
                }
            },
        },
    ];
};
