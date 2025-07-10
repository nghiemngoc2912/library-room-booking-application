using Microsoft.EntityFrameworkCore;
using ServerSide.DTOs;
using ServerSide.Models;
using ServerSide.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ServerSide.Services
{
    public class SlotService : ISlotService
    {
        private readonly ISlotRepository slotRepository;

        public SlotService(ISlotRepository slotRepository)
        {
            this.slotRepository = slotRepository;
        }

        public IEnumerable<Slot> GetAll()
        {
            return slotRepository.GetAll();
        }

        public Slot GetById(int id)
        {
            return slotRepository.GetById(id);
        }

        public SlotDTO GetSlotByIdForUpdate(int id)
        {
            var slot = slotRepository.GetById(id);
            return slot != null ? new SlotDTO(slot) : null;
        }

        public IEnumerable<SlotDTO> GetFilteredSlots(string search = null, int? status = null)
        {
            var slots = slotRepository.GetAll().AsQueryable();

            if (!string.IsNullOrWhiteSpace(search) && int.TryParse(search, out int order))
            {
                slots = slots.Where(s => s.Order == order);
            }

            if (status.HasValue)
            {
                byte statusByte = status.Value switch
                {
                    -2 => 254,
                    -1 => 255,
                    _ => (byte)status.Value
                };
                slots = slots.Where(s => s.Status == statusByte);
            }

            return slots.Select(s => new SlotDTO(s)).ToList();
        }

        public bool CreateSlot(SlotDTO slotDTO)
        {
            if (slotDTO == null)
            {
                throw new ArgumentNullException("DTO không hợp lệ.");
            }

            if (slotDTO.Order <= 0)
            {
                throw new ArgumentException("Order phải lớn hơn 0.");
            }

            if (!TimeOnly.TryParse(slotDTO.FromTime, out TimeOnly fromTime) ||
                !TimeOnly.TryParse(slotDTO.ToTime, out TimeOnly toTime))
            {
                throw new ArgumentException("Thời gian không hợp lệ. Định dạng: HH:mm.");
            }

            if (fromTime >= toTime)
            {
                throw new ArgumentException("FromTime phải nhỏ hơn ToTime.");
            }

            if (!(slotDTO.Status == 0 || slotDTO.Status == 1 || slotDTO.Status == 254 || slotDTO.Status == 255))
            {
                throw new ArgumentException("Trạng thái không hợp lệ. Giá trị hợp lệ: -2 (Maintenance), -1 (Inactive), 0 (Pending), 1 (Active).");
            }

            var slot = new Slot
            {
                Order = slotDTO.Order,
                FromTime = fromTime,
                ToTime = toTime,
                Status = slotDTO.Status
            };

            return slotRepository.Create(slot);
        }

        public bool UpdateSlot(SlotDTO slotDTO)
        {
            if (slotDTO == null)
            {
                throw new ArgumentNullException("DTO không hợp lệ.");
            }

            if (slotDTO.Order <= 0)
            {
                throw new ArgumentException("Order phải lớn hơn 0.");
            }

            if (!TimeOnly.TryParse(slotDTO.FromTime, out TimeOnly fromTime) ||
                !TimeOnly.TryParse(slotDTO.ToTime, out TimeOnly toTime))
            {
                throw new ArgumentException("Thời gian không hợp lệ. Định dạng: HH:mm.");
            }

            if (fromTime >= toTime)
            {
                throw new ArgumentException("FromTime phải nhỏ hơn ToTime.");
            }

            if (!(slotDTO.Status == 0 || slotDTO.Status == 1 || slotDTO.Status == 254 || slotDTO.Status == 255))
            {
                throw new ArgumentException("Trạng thái không hợp lệ. Giá trị hợp lệ: -2 (Maintenance), -1 (Inactive), 0 (Pending), 1 (Active).");
            }

            var slot = slotRepository.GetById(slotDTO.Id);
            if (slot == null)
            {
                return false;
            }

            slot.Order = slotDTO.Order;
            slot.FromTime = fromTime;
            slot.ToTime = toTime;
            slot.Status = slotDTO.Status;

            return slotRepository.Update(slot);
        }

        public bool DeactivateSlot(int id)
        {
            var slot = slotRepository.GetById(id);
            if (slot == null || slot.Status != 1) // Only deactivate Active slots
            {
                return false;
            }

            slot.Status = 255; // Inactive
            return slotRepository.Update(slot);
        }

        public bool ActivateSlot(int id)
        {
            var slot = slotRepository.GetById(id);
            if (slot == null || slot.Status != 255) // Only activate Inactive slots
            {
                return false;
            }

            slot.Status = 1; // Active
            return slotRepository.Update(slot);
        }
    }

    public interface ISlotService
    {
        IEnumerable<Slot> GetAll();
        Slot GetById(int id);
        SlotDTO GetSlotByIdForUpdate(int id);
        IEnumerable<SlotDTO> GetFilteredSlots(string search = null, int? status = null);
        bool CreateSlot(SlotDTO slotDTO);
        bool UpdateSlot(SlotDTO slotDTO);
        bool DeactivateSlot(int id);
        bool ActivateSlot(int id);
    }
}