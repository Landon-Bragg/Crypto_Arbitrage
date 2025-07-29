import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { User, Crown, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export function UserMenu() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex gap-2">
        <Link href="/login">
          <Button variant="outline" size="sm">
            <User className="w-4 h-4 mr-2" />
            Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <User className="w-4 h-4 mr-2" />
          {user.username}
          {user.isPremium && <Crown className="w-4 h-4 ml-2 text-yellow-500" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div>
            <p className="font-medium">{user.username}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <div className="flex items-center justify-between w-full">
            <span>Status</span>
            <Badge variant={user.isPremium ? "default" : "secondary"}>
              {user.isPremium ? "Premium" : "Free"}
            </Badge>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {!user.isPremium && (
          <DropdownMenuItem>
            <Crown className="w-4 h-4 mr-2 text-yellow-500" />
            Upgrade to Premium
          </DropdownMenuItem>
        )}
        <DropdownMenuItem>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}