# Troubleshooting

Common issues and solutions for DClaw Finance.

## Quick Diagnostics

```bash
# Check app pods
kubectl get pods -n dclaw-finance

# Check logs
kubectl logs -n dclaw-finance deployment/dclaw-finance-backend

# Check database
kubectl get clusters -n dclaw-finance
```

## Sections

- [Common Issues](./common-issues)
- [FAQ](./faq)
