# build-php action

This action builds the PHP interpreter and libraries from source with high
granularity of configuration.

## Inputs

### `version`

**Required** The version of PHP to compile. Default `"latest"`.

## Outputs

### `php_bin`

The PHP interpreter binary.

## Example usage

```yaml
uses: i4ki/build-php
with:
  version: "8.10"
```

