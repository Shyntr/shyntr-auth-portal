'use client';

import {useTransition} from 'react';
import {useTranslations} from 'next-intl';
import {handleLogoutAccept, handleLogoutReject} from '@/actions/auth';
import {CardWrapper} from './CardWrapper';
import {Button} from '@/components/ui/button';
import {LogOut, Loader2} from 'lucide-react';

interface LogoutFormProps {
    logoutChallenge: string;
    clientName?: string;
}

export function LogoutForm({logoutChallenge, clientName}: LogoutFormProps) {
    const t = useTranslations('logout');

    const [isPending, startTransition] = useTransition();
    const [isRejecting, startRejectTransition] = useTransition();

    const isProcessing = isPending || isRejecting;

    const onAccept = () => {
        startTransition(async () => {
            await handleLogoutAccept(logoutChallenge);
        });
    };

    const onReject = () => {
        startRejectTransition(async () => {
            await handleLogoutReject(logoutChallenge);
        });
    };

    return (
        <CardWrapper>
            <div className="text-center mb-6">
                <div className="mx-auto mb-4 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <LogOut className="w-6 h-6 text-gray-600"/>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('confirmTitle')}
                </h1>
                <p className="text-sm text-gray-500">
                    {clientName ? (
                        <>
                            {t('confirmAppDesc', {clientName: clientName})}
                        </>
                    ) : (
                        <>
                            {t('confirmDesc')}
                        </>
                    )}
                </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
                <Button
                    onClick={onAccept}
                    disabled={isProcessing}
                    variant="destructive"
                    className="w-full h-11 text-sm font-semibold rounded-xl"
                >
                    {isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> {t('processing')}</>
                    ) : (
                        t('yesSignOut')
                    )}
                </Button>
                <Button
                    onClick={onReject}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full h-11 text-sm font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                    {isRejecting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> {t('canceling')}</>
                    ) : (
                        t('cancel')
                    )}
                </Button>
            </div>
        </CardWrapper>
    );
}