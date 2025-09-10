<?php

namespace App\Enums;

enum UserRole: string
{
    case CLIENT = 'CLIENT';
    case OWNER = 'OWNER';
    case ADMIN = 'ADMIN';

    public function label(): string
    {
        return match ($this) {
            self::CLIENT => 'Client',
            self::OWNER => 'Owner',
            self::ADMIN => 'Admin',
        };
    }
}
