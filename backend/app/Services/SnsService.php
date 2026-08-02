<?php

namespace App\Services;

use Aws\Sns\SnsClient;
use Throwable;

class SnsService
{
    protected ?SnsClient $client = null;

    public function __construct()
    {
        $key = config('services.sns.key', config('filesystems.disks.s3.key'));
        $secret = config('services.sns.secret', config('filesystems.disks.s3.secret'));
        $region = config('services.sns.region', config('filesystems.disks.s3.region', 'us-east-1'));

        if ($key && $secret) {
            $this->client = new SnsClient([
                'version' => 'latest',
                'region'  => $region,
                'credentials' => [
                    'key'    => $key,
                    'secret' => $secret,
                ],
            ]);
        }
    }

    /**
     * Send direct SMS via AWS SNS
     */
    public function sendSms(string $phoneNumber, string $message): bool
    {
        if (! $this->client) {
            logger()->warning('AWS SNS client is not configured.', ['phone' => $phoneNumber, 'message' => $message]);
            return false;
        }

        try {
            $this->client->publish([
                'Message'     => $message,
                'PhoneNumber' => $phoneNumber,
            ]);

            return true;
        } catch (Throwable $e) {
            logger()->error('Failed to send SMS via AWS SNS: ' . $e->getMessage(), [
                'phone' => $phoneNumber,
                'error' => $e->getTraceAsString(),
            ]);

            return false;
        }
    }

    /**
     * Publish notification to an AWS SNS Topic
     */
    public function publishToTopic(string $topicArn, string $subject, string $message, array $attributes = []): bool
    {
        if (! $this->client) {
            logger()->warning('AWS SNS client is not configured for topic publish.', ['topicArn' => $topicArn]);
            return false;
        }

        try {
            $params = [
                'TopicArn' => $topicArn,
                'Subject'  => $subject,
                'Message'  => $message,
            ];

            if (! empty($attributes)) {
                $params['MessageAttributes'] = $attributes;
            }

            $this->client->publish($params);

            return true;
        } catch (Throwable $e) {
            logger()->error('Failed to publish to AWS SNS topic: ' . $e->getMessage(), [
                'topicArn' => $topicArn,
                'error'    => $e->getTraceAsString(),
            ]);

            return false;
        }
    }
}
