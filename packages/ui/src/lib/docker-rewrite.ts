/**
 * Docker detection and localhost URL rewriting utilities
 * When running in Docker, rewrites localhost/127.0.0.1 URLs to host.docker.internal
 * so webhooks can reach services running on the host machine.
 */

import { readFileSync, existsSync } from "fs";

let isDockerCached: boolean | null = null;

/**
 * Detect if we're running inside a Docker container
 */
export function isRunningInDocker(): boolean {
  if (isDockerCached !== null) {
    return isDockerCached;
  }

  try {
    // Method 1: Check for .dockerenv file
    if (existsSync("/.dockerenv")) {
      isDockerCached = true;
      return true;
    }

    // Method 2: Check cgroup (more reliable on some systems)
    if (existsSync("/proc/1/cgroup")) {
      const cgroup = readFileSync("/proc/1/cgroup", "utf-8");
      if (cgroup.includes("docker") || cgroup.includes("containerd")) {
        isDockerCached = true;
        return true;
      }
    }
  } catch {
    // If we can't check, assume not Docker (fail safe)
  }

  isDockerCached = false;
  return false;
}

/**
 * Rewrite localhost/127.0.0.1 URLs to host.docker.internal when running in Docker
 * Preserves protocol, port, path, and query string
 */
export function rewriteLocalhostForDocker(url: string): string {
  if (!isRunningInDocker()) {
    return url;
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Check if hostname is a loopback address
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "[::1]"
    ) {
      // Rewrite to host.docker.internal
      parsed.hostname = "host.docker.internal";
      return parsed.toString();
    }
  } catch {
    // If URL parsing fails, return original URL
  }

  return url;
}

